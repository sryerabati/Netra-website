from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('me/', views.get_current_user, name='current_user'),
    path('users/<str:role>/', views.list_users_by_role, name='users_by_role'),

    # Predict (test only)
    path('predict/', views.predict, name='predict'),

    # Scan operations
    path('upload-scan/', views.upload_scan, name='upload_scan'),
    path('my-scans/', views.my_scans, name='my_scans'),
    path('nurse-scans/', views.nurse_scans, name='nurse_scans'),
    path('all-scans/', views.all_scans, name='all_scans'),
    path('scans/<int:scan_id>/', views.scan_detail, name='scan_detail'),
    path('scans/<int:scan_id>/update/', views.update_scan, name='update_scan'),
    path('scans/<int:scan_id>/notes/', views.add_doctor_note, name='add_doctor_note'),
    path('scan-stats/', views.scan_stats, name='scan_stats'),

    # Patient-Doctor subscriptions
    path('subscriptions/', views.patient_subscriptions, name='patient_subscriptions'),
    path('subscribe/', views.subscribe_to_doctor, name='subscribe_to_doctor'),
    path('subscriptions/<int:subscription_id>/unsubscribe/', views.unsubscribe_from_doctor, name='unsubscribe'),

    # Doctor features
    path('doctor/patients/', views.doctor_patients, name='doctor_patients'),
    path('doctor/patients/<int:patient_id>/history/', views.patient_scan_history, name='patient_history'),
]
