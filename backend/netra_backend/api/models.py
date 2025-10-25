from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('technician', 'Technician'),
        ('doctor', 'Doctor'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')

    def __str__(self):
        return f"{self.username} ({self.role})"


class RetinalScan(models.Model):
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='scans',
        limit_choices_to={'role': 'patient'}
    )
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, related_name='uploads',
        limit_choices_to={'role': 'technician'}
    )
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reviews',
        limit_choices_to={'role': 'doctor'}
    )
    image = models.ImageField(upload_to='uploads/')
    ai_prediction = models.CharField(max_length=50, blank=True, null=True)
    confidence = models.FloatField(blank=True, null=True)
    doctor_review = models.CharField(max_length=50, blank=True, null=True)
    doctor_notes = models.TextField(blank=True, null=True)
    reviewed = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.username} - {self.timestamp.strftime('%Y-%m-%d')}"
