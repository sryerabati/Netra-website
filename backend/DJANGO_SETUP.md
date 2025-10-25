# Django Backend Setup Guide

## Prerequisites

```bash
# Make sure you have Python 3.8+ installed
python3 --version

# Install pip if not installed
python3 -m pip install --upgrade pip
```

## Installation Steps

### 1. Navigate to backend directory
```bash
cd backend/netra_backend
```

### 2. Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

Install the PostgreSQL client libraries that the Python driver relies on:

```bash
# macOS
brew install postgresql

# Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y libpq-dev
```

Then install the Python dependencies (including the PostgreSQL driver) from the provided requirements file:

```bash
pip install -r ../requirements.txt
```

> 💡 The requirements file installs the modern `psycopg[binary]` driver. If you prefer the legacy driver, replace it with `psycopg2-binary` in `backend/requirements.txt` before running the command above.

### 4. Create migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create superuser (admin)
```bash
python manage.py createsuperuser
```

### 6. Run the server
```bash
python manage.py runserver 0.0.0.0:8000
```

> ℹ️ If you switched the database engine to PostgreSQL, rerun `python manage.py migrate` (after updating your `DATABASES` setting) and then start the server to confirm Django can connect successfully.

The API will be available at `http://localhost:8000/api/`

---

## API Endpoints

### Authentication
- `POST /api/register/` - Register new user
  ```json
  {
    "username": "john",
    "email": "john@example.com",
    "password": "secure123",
    "full_name": "John Doe",
    "role": "patient"  // or "nurse" or "doctor"
  }
  ```

- `POST /api/login/` - Login and get JWT tokens
  ```json
  {
    "username": "john",
    "password": "secure123"
  }
  ```

- `GET /api/me/` - Get current user info (requires auth)

### User Management
- `GET /api/users/patient/` - List all patients
- `GET /api/users/nurse/` - List all nurses
- `GET /api/users/doctor/` - List all doctors

### Scan Operations
- `POST /api/upload-scan/` - Upload retina scan (Nurse only)
  - Form data: `patient_id`, `doctor_id`, `left_eye` (file), `right_eye` (file), `patient_age`, `patient_diabetes_duration`

- `GET /api/my-scans/` - View patient's own scans (Patient only)

- `GET /api/nurse-scans/` - View nurse's uploaded scans (Nurse only)

- `GET /api/all-scans/` - View doctor's assigned scans (Doctor only)
  - Query params: `?priority=urgent` or `?status=pending`

- `GET /api/scans/<id>/` - Get scan details

- `PATCH /api/scans/<id>/update/` - Update scan priority/status (Doctor only)
  ```json
  {
    "priority": "urgent",  // low/medium/high/urgent
    "status": "reviewed"   // pending/reviewed/completed
  }
  ```

- `POST /api/scans/<id>/notes/` - Add doctor note (Doctor only)
  ```json
  {
    "note_text": "Patient shows signs of moderate DR..."
  }
  ```

- `GET /api/scan-stats/` - Get scan statistics (Doctor only)

### Subscriptions
- `GET /api/subscriptions/` - Get patient's subscriptions (Patient only)

- `POST /api/subscribe/` - Subscribe to doctor (Patient only)
  ```json
  {
    "doctor_id": 2
  }
  ```

- `DELETE /api/subscriptions/<id>/unsubscribe/` - Unsubscribe from doctor (Patient only)

### Doctor Features
- `GET /api/doctor/patients/` - Get subscribed patients (Doctor only)

- `GET /api/doctor/patients/<id>/history/` - Get patient scan history (Doctor only)

### Testing
- `POST /api/predict/` - Test AI prediction (no auth required)
  - Form data: `image` (file)

---

## Authentication Headers

For protected endpoints, include the JWT token in the header:

```
Authorization: Bearer <your_access_token>
```

---

## Response Formats

### Success Response
```json
{
  "message": "Scan uploaded and analyzed.",
  "data": {
    "id": 1,
    "patient": {...},
    "nurse": {...},
    "doctor": {...},
    "ai_prediction": "Moderate DR",
    "ai_confidence": 0.87,
    "priority": "medium",
    "status": "pending",
    "images": [...],
    "doctor_notes": [...]
  }
}
```

### Error Response
```json
{
  "error": "Only nurses can upload scans."
}
```

---

## Admin Panel

Access the Django admin at `http://localhost:8000/admin/`

Use the superuser credentials you created earlier.

---

## Testing with cURL

### Register a user
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"patient1","email":"patient@test.com","password":"test123","full_name":"Test Patient","role":"patient"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"patient1","password":"test123"}'
```

### Upload scan (with token)
```bash
curl -X POST http://localhost:8000/api/upload-scan/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "patient_id=1" \
  -F "doctor_id=2" \
  -F "left_eye=@/path/to/image.jpg"
```

---

## Database Schema

### User
- id, username, email, password, role, full_name, phone

### RetinalScan
- id, patient_id, nurse_id, doctor_id
- ai_prediction, ai_confidence, ai_details
- priority, status
- patient_age, patient_diabetes_duration
- created_at, updated_at

### ScanImage
- id, scan_id, image, eye_side, created_at

### DoctorNote
- id, scan_id, doctor_id, note_text, created_at, updated_at

### PatientDoctorSubscription
- id, patient_id, doctor_id, is_active, created_at

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001
```

### Database migrations error
```bash
# Delete db.sqlite3 and start fresh
rm db.sqlite3
rm -rf api/migrations/__pycache__
python manage.py makemigrations
python manage.py migrate
```

### CORS issues
The backend is configured with `CORS_ALLOW_ALL_ORIGINS = True` for development.
For production, update `settings.py` to whitelist only your frontend domain.

---

## Production Deployment

### Use PostgreSQL instead of SQLite
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'netra_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Use environment variables
```bash
pip install python-decouple
```

```python
# settings.py
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
```

### Collect static files
```bash
python manage.py collectstatic
```

### Use Gunicorn
```bash
pip install gunicorn
gunicorn netra_backend.wsgi:application --bind 0.0.0.0:8000
```

---

## Next Steps

1. Start the Django server
2. Create test users (1 patient, 1 nurse, 1 doctor)
3. Test API endpoints with Postman or cURL
4. Connect frontend to Django backend
5. Replace AI model mock with your actual model in `model_loader.py`
