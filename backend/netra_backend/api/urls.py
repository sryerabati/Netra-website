from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.predict, name='predict'),
    path('upload-scan/', views.upload_scan, name='upload_scan'),
    path('review-scan/<int:scan_id>/', views.review_scan, name='review_scan'),
    path('my-scans/', views.my_scans, name='my_scans'),
    path('all-scans/', views.list_all_scans, name='list_all_scans'),
]
