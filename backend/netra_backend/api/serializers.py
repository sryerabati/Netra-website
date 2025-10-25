from rest_framework import serializers
from .models import RetinalScan, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'email']

class RetinalScanSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    uploaded_by = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)

    class Meta:
        model = RetinalScan
        fields = '__all__'
