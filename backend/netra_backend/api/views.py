from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .model_loader import load_model, predict_image
from .models import RetinalScan, ScanImage, DoctorNote, PatientDoctorSubscription
from .serializers import (
    RetinalScanSerializer, UserSerializer, RegisterSerializer,
    ScanImageSerializer, DoctorNoteSerializer, PatientDoctorSubscriptionSerializer
)

User = get_user_model()
model = load_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login and get JWT tokens"""
    from django.contrib.auth import authenticate

    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users_by_role(request, role):
    """List all users by role (patient/nurse/doctor)"""
    users = User.objects.filter(role=role)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def predict(request):
    """Run prediction on a single uploaded image (no DB save)"""
    try:
        image = request.FILES.get('image')
        if not image:
            return Response({"error": "No image file provided."}, status=400)

        result = predict_image(model, image)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_scan(request):
    """Nurse uploads scan images for a patient"""
    if request.user.role != 'nurse':
        return Response({'error': 'Only nurses can upload scans.'}, status=403)

    patient_id = request.data.get('patient_id')
    doctor_id = request.data.get('doctor_id')
    patient_age = request.data.get('patient_age')
    diabetes_duration = request.data.get('patient_diabetes_duration')

    left_eye = request.FILES.get('left_eye')
    right_eye = request.FILES.get('right_eye')

    if not patient_id or not doctor_id:
        return Response({'error': 'Missing patient_id or doctor_id.'}, status=400)

    if not left_eye and not right_eye:
        return Response({'error': 'At least one eye image is required.'}, status=400)

    patient = get_object_or_404(User, id=patient_id, role='patient')
    doctor = get_object_or_404(User, id=doctor_id, role='doctor')

    scan = RetinalScan.objects.create(
        patient=patient,
        nurse=request.user,
        doctor=doctor,
        patient_age=int(patient_age) if patient_age else None,
        patient_diabetes_duration=int(diabetes_duration) if diabetes_duration else None,
        status='pending',
        priority='medium'
    )

    image_urls = []
    ai_results = {}

    if left_eye:
        result_left = predict_image(model, left_eye)
        scan_image = ScanImage.objects.create(
            scan=scan,
            image=left_eye,
            eye_side='left'
        )
        image_urls.append(scan_image.image.url)

        scan.left_eye_prediction = result_left.get('prediction')
        scan.left_eye_prediction_class = result_left.get('prediction_class')
        ai_results['left_eye'] = result_left

    if right_eye:
        result_right = predict_image(model, right_eye)
        scan_image = ScanImage.objects.create(
            scan=scan,
            image=right_eye,
            eye_side='right'
        )
        image_urls.append(scan_image.image.url)

        scan.right_eye_prediction = result_right.get('prediction')
        scan.right_eye_prediction_class = result_right.get('prediction_class')
        ai_results['right_eye'] = result_right

    scan.ai_details = ai_results
    scan.save()

    serializer = RetinalScanSerializer(scan, context={'request': request})
    return Response({
        'message': 'Scan uploaded and analyzed.',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_scans(request):
    """Patients can view their own scans"""
    if request.user.role != 'patient':
        return Response({'error': 'Only patients can view their scans.'}, status=403)

    scans = RetinalScan.objects.filter(patient=request.user).prefetch_related('images', 'doctor_notes')
    serializer = RetinalScanSerializer(scans, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nurse_scans(request):
    """Nurses can view scans they uploaded"""
    if request.user.role != 'nurse':
        return Response({'error': 'Only nurses can view their uploads.'}, status=403)

    scans = RetinalScan.objects.filter(nurse=request.user).prefetch_related('images', 'doctor_notes')
    serializer = RetinalScanSerializer(scans, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_scans(request):
    """Doctors can view all scans assigned to them"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can view all scans.'}, status=403)

    priority_filter = request.GET.get('priority')
    status_filter = request.GET.get('status')

    scans = RetinalScan.objects.filter(doctor=request.user).prefetch_related('images', 'doctor_notes')

    if priority_filter:
        scans = scans.filter(priority=priority_filter)
    if status_filter:
        scans = scans.filter(status=status_filter)

    serializer = RetinalScanSerializer(scans, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scan_detail(request, scan_id):
    """Get detailed information about a specific scan"""
    scan = get_object_or_404(RetinalScan, id=scan_id)

    if request.user.role == 'patient' and scan.patient != request.user:
        return Response({'error': 'Access denied'}, status=403)
    elif request.user.role == 'nurse' and scan.nurse != request.user:
        return Response({'error': 'Access denied'}, status=403)
    elif request.user.role == 'doctor' and scan.doctor != request.user:
        return Response({'error': 'Access denied'}, status=403)

    serializer = RetinalScanSerializer(scan, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_scan(request, scan_id):
    """Doctor updates scan priority and status"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can update scans.'}, status=403)

    scan = get_object_or_404(RetinalScan, id=scan_id, doctor=request.user)

    priority = request.data.get('priority')
    scan_status = request.data.get('status')

    if priority:
        scan.priority = priority
    if scan_status:
        scan.status = scan_status

    scan.save()

    serializer = RetinalScanSerializer(scan, context={'request': request})
    return Response({
        'message': 'Scan updated successfully.',
        'data': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_doctor_note(request, scan_id):
    """Doctor adds a note to a scan"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can add notes.'}, status=403)

    scan = get_object_or_404(RetinalScan, id=scan_id, doctor=request.user)
    note_text = request.data.get('note_text')

    if not note_text:
        return Response({'error': 'Note text is required.'}, status=400)

    note = DoctorNote.objects.create(
        scan=scan,
        doctor=request.user,
        note_text=note_text
    )

    serializer = DoctorNoteSerializer(note)
    return Response({
        'message': 'Note added successfully.',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_subscriptions(request):
    """Get patient's doctor subscriptions"""
    if request.user.role != 'patient':
        return Response({'error': 'Only patients can view subscriptions.'}, status=403)

    subscriptions = PatientDoctorSubscription.objects.filter(
        patient=request.user,
        is_active=True
    ).select_related('doctor')

    serializer = PatientDoctorSubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_to_doctor(request):
    """Patient subscribes to a doctor"""
    if request.user.role != 'patient':
        return Response({'error': 'Only patients can subscribe to doctors.'}, status=403)

    doctor_id = request.data.get('doctor_id')
    if not doctor_id:
        return Response({'error': 'doctor_id is required.'}, status=400)

    doctor = get_object_or_404(User, id=doctor_id, role='doctor')

    subscription, created = PatientDoctorSubscription.objects.get_or_create(
        patient=request.user,
        doctor=doctor,
        defaults={'is_active': True}
    )

    if not created and not subscription.is_active:
        subscription.is_active = True
        subscription.save()

    serializer = PatientDoctorSubscriptionSerializer(subscription)
    return Response({
        'message': 'Successfully subscribed to doctor.',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsubscribe_from_doctor(request, subscription_id):
    """Patient unsubscribes from a doctor"""
    if request.user.role != 'patient':
        return Response({'error': 'Only patients can unsubscribe.'}, status=403)

    subscription = get_object_or_404(
        PatientDoctorSubscription,
        id=subscription_id,
        patient=request.user
    )

    subscription.is_active = False
    subscription.save()

    return Response({'message': 'Successfully unsubscribed from doctor.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients(request):
    """Get all patients subscribed to this doctor"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can view their patients.'}, status=403)

    subscriptions = PatientDoctorSubscription.objects.filter(
        doctor=request.user,
        is_active=True
    ).select_related('patient')

    patients = [sub.patient for sub in subscriptions]
    serializer = UserSerializer(patients, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_scan_history(request, patient_id):
    """Doctor views a specific patient's scan history"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can view patient history.'}, status=403)

    patient = get_object_or_404(User, id=patient_id, role='patient')

    scans = RetinalScan.objects.filter(
        patient=patient,
        doctor=request.user
    ).prefetch_related('images', 'doctor_notes')

    serializer = RetinalScanSerializer(scans, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scan_stats(request):
    """Get scan statistics for doctors"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can view stats.'}, status=403)

    total_scans = RetinalScan.objects.filter(doctor=request.user).count()
    pending_scans = RetinalScan.objects.filter(doctor=request.user, status='pending').count()
    urgent_scans = RetinalScan.objects.filter(doctor=request.user, priority='urgent').count()

    return Response({
        'total': total_scans,
        'pending': pending_scans,
        'urgent': urgent_scans
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_scans(request):
    """Admins can view all scans in the system"""
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can view all scans.'}, status=403)

    priority_filter = request.GET.get('priority')
    status_filter = request.GET.get('status')

    scans = RetinalScan.objects.all().prefetch_related('images', 'doctor_notes')

    if priority_filter:
        scans = scans.filter(priority=priority_filter)
    if status_filter:
        scans = scans.filter(status=status_filter)

    serializer = RetinalScanSerializer(scans, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_scan(request, scan_id):
    """Admins can delete any scan"""
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can delete scans.'}, status=403)

    scan = get_object_or_404(RetinalScan, id=scan_id)
    scan.delete()

    return Response({'message': 'Scan deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Get system-wide statistics for admins"""
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can view system stats.'}, status=403)

    total_scans = RetinalScan.objects.count()
    total_users = User.objects.count()
    total_patients = User.objects.filter(role='patient').count()
    total_doctors = User.objects.filter(role='doctor').count()
    total_nurses = User.objects.filter(role='nurse').count()
    pending_scans = RetinalScan.objects.filter(status='pending').count()
    urgent_scans = RetinalScan.objects.filter(priority='urgent').count()

    return Response({
        'total_scans': total_scans,
        'total_users': total_users,
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_nurses': total_nurses,
        'pending_scans': pending_scans,
        'urgent_scans': urgent_scans
    })
