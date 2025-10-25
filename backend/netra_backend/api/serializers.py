from rest_framework import serializers
from .models import RetinalScan, ScanImage, DoctorNote, PatientDoctorSubscription, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'full_name', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            role=validated_data.get('role', 'patient')
        )
        return user


class ScanImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ScanImage
        fields = ['id', 'image', 'image_url', 'eye_side', 'created_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class DoctorNoteSerializer(serializers.ModelSerializer):
    doctor = UserSerializer(read_only=True)

    class Meta:
        model = DoctorNote
        fields = ['id', 'doctor', 'note_text', 'created_at', 'updated_at']


class RetinalScanSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    nurse = UserSerializer(read_only=True)
    doctor = UserSerializer(read_only=True)
    images = ScanImageSerializer(many=True, read_only=True)
    doctor_notes = DoctorNoteSerializer(many=True, read_only=True)

    class Meta:
        model = RetinalScan
        fields = [
            'id', 'patient', 'nurse', 'doctor', 'ai_prediction', 'ai_confidence',
            'ai_details', 'priority', 'status', 'patient_age', 'patient_diabetes_duration',
            'created_at', 'updated_at', 'images', 'doctor_notes'
        ]


class PatientDoctorSubscriptionSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    doctor = UserSerializer(read_only=True)

    class Meta:
        model = PatientDoctorSubscription
        fields = ['id', 'patient', 'doctor', 'is_active', 'created_at']
