from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('nurse', 'Nurse'),
        ('doctor', 'Doctor'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class PatientDoctorSubscription(models.Model):
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='doctor_subscriptions',
        limit_choices_to={'role': 'patient'}
    )
    doctor = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='patient_subscriptions',
        limit_choices_to={'role': 'doctor'}
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('patient', 'doctor')

    def __str__(self):
        return f"{self.patient.username} -> Dr. {self.doctor.username}"


class RetinalScan(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('completed', 'Completed'),
    ]

    patient = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='scans',
        limit_choices_to={'role': 'patient'}
    )
    nurse = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, related_name='uploads',
        limit_choices_to={'role': 'nurse'}
    )
    doctor = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, related_name='reviews',
        limit_choices_to={'role': 'doctor'}
    )

    left_eye_prediction = models.CharField(max_length=255, blank=True, null=True)
    left_eye_prediction_class = models.IntegerField(blank=True, null=True)
    right_eye_prediction = models.CharField(max_length=255, blank=True, null=True)
    right_eye_prediction_class = models.IntegerField(blank=True, null=True)
    ai_details = models.JSONField(blank=True, null=True)

    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    patient_age = models.IntegerField(blank=True, null=True)
    patient_diabetes_duration = models.IntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient.username} - {self.created_at.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-created_at']


class ScanImage(models.Model):
    EYE_CHOICES = [
        ('left', 'Left'),
        ('right', 'Right'),
        ('both', 'Both'),
    ]

    scan = models.ForeignKey(RetinalScan, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='retina_scans/')
    eye_side = models.CharField(max_length=10, choices=EYE_CHOICES, default='both')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.scan.patient.username} - {self.eye_side} - {self.created_at.strftime('%Y-%m-%d')}"


class DoctorNote(models.Model):
    scan = models.ForeignKey(RetinalScan, on_delete=models.CASCADE, related_name='doctor_notes')
    doctor = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='notes',
        limit_choices_to={'role': 'doctor'}
    )
    note_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Note by Dr. {self.doctor.username} on {self.scan}"

    class Meta:
        ordering = ['-created_at']
