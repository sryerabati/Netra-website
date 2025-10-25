from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .model_loader import load_model, predict_image
from .models import RetinalScan
from .serializers import RetinalScanSerializer, UserSerializer

# Load your custom user model and AI model once
User = get_user_model()
model = load_model()  # PyTorch model loaded at startup


# ---------- 1. Predict (public endpoint) ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def predict(request):
    """Run prediction on a single uploaded image (no DB save)."""
    try:
        image = request.FILES.get('image')
        if not image:
            return Response({"error": "No image file provided."}, status=400)

        result = predict_image(model, image)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------- 2. Technician Upload ----------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_scan(request):
    """Technician uploads an image for a patient — runs AI prediction and saves it."""
    if request.user.role != 'technician':
        return Response({'error': 'Only technicians can upload scans.'}, status=403)

    patient_id = request.data.get('patient_id')
    image_file = request.FILES.get('image')

    if not patient_id or not image_file:
        return Response({'error': 'Missing patient_id or image.'}, status=400)

    patient = get_object_or_404(User, id=patient_id, role='patient')

    # Run AI model
    result = predict_image(model, image_file)

    # Save record to DB
    scan = RetinalScan.objects.create(
        patient=patient,
        uploaded_by=request.user,
        image=image_file,
        ai_prediction=result['prediction'],
        confidence=result['confidence']
    )

    serializer = RetinalScanSerializer(scan)
    return Response({'message': 'Scan uploaded and analyzed.', 'data': serializer.data})


# ---------- 3. Doctor Review ----------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_scan(request, scan_id):
    """Doctor adds review and notes to a scan."""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can review scans.'}, status=403)

    scan = get_object_or_404(RetinalScan, id=scan_id)
    scan.doctor_review = request.data.get('review', '')
    scan.doctor_notes = request.data.get('notes', '')
    scan.reviewed_by = request.user
    scan.reviewed = True
    scan.save()

    serializer = RetinalScanSerializer(scan)
    return Response({'message': 'Review and notes saved.', 'data': serializer.data})


# ---------- 4. Patient View ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_scans(request):
    """Patients can view their own scans and AI/doctor results."""
    if request.user.role != 'patient':
        return Response({'error': 'Only patients can view their scans.'}, status=403)

    scans = RetinalScan.objects.filter(patient=request.user).order_by('-timestamp')
    serializer = RetinalScanSerializer(scans, many=True)
    return Response(serializer.data)


# ---------- 5. Doctor — list all scans ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_scans(request):
    """Doctors can view all uploaded scans."""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can view all scans.'}, status=403)

    scans = RetinalScan.objects.all().order_by('-timestamp')
    serializer = RetinalScanSerializer(scans, many=True)
    return Response(serializer.data)
