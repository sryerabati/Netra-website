# 🩺 Netra - Complete Setup Guide

## ✅ What's Been Completed

### Frontend (React + TypeScript + Vite)
- ✅ Complete authentication system with JWT
- ✅ Landing page with AI prediction demo
- ✅ Login and Signup pages
- ✅ Patient Dashboard - View scans, subscribe to doctors, read notes
- ✅ Nurse Dashboard - Upload scans with left/right eye images
- ✅ Doctor Dashboard - Review scans, update priority/status, add notes
- ✅ Role-based routing and access control
- ✅ Beautiful glassmorphism UI with dark mode
- ✅ Fully responsive design

### Backend (Django + Django REST Framework)
- ✅ Complete REST API with 20+ endpoints
- ✅ JWT authentication (register, login)
- ✅ Custom User model with roles (patient/nurse/doctor)
- ✅ RetinalScan model with AI prediction fields
- ✅ ScanImage model (left/right eye images)
- ✅ DoctorNote model
- ✅ PatientDoctorSubscription model
- ✅ Role-based access control on all endpoints
- ✅ Media file handling for retina images
- ✅ AI model integration point ready

---

## 🚀 Quick Start Guide

### 1. Start Django Backend

```bash
cd backend/netra_backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow torch torchvision

# Create database and run migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser (for admin access)
python manage.py createsuperuser

# Start the server
python manage.py runserver 0.0.0.0:8000
```

Backend will be available at: `http://localhost:8000/api/`

### 2. Start Frontend

```bash
# In the project root directory
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173/`

---

## 👥 Create Test Users

You can create users either through:

**A) Django Admin Panel** (http://localhost:8000/admin/)
- Login with your superuser credentials
- Create users with different roles

**B) API Endpoint**
```bash
# Create a Patient
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patient1",
    "email": "patient@test.com",
    "password": "test123",
    "full_name": "John Patient",
    "role": "patient"
  }'

# Create a Nurse
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nurse1",
    "email": "nurse@test.com",
    "password": "test123",
    "full_name": "Jane Nurse",
    "role": "nurse"
  }'

# Create a Doctor
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "doctor1",
    "email": "doctor@test.com",
    "password": "test123",
    "full_name": "Dr. Smith",
    "role": "doctor"
  }'
```

**C) Signup Page**
- Go to http://localhost:5173/signup
- Fill in the form and select a role

---

## 🧪 Testing the Complete Workflow

### 1. Patient Workflow
1. Go to http://localhost:5173/signup
2. Create a patient account
3. Login at http://localhost:5173/login
4. Click "Add Doctor" to subscribe to a doctor
5. Wait for a nurse to upload scans
6. View scans, AI predictions, and doctor notes

### 2. Nurse Workflow
1. Create a nurse account
2. Login → Nurse Dashboard
3. **Upload Scan Tab:**
   - Select a patient
   - Assign to a doctor
   - Upload left/right eye images
   - Add optional age and diabetes duration
   - Submit → AI automatically analyzes
4. **My Submissions Tab:**
   - View all uploaded scans
   - See status updates from doctors

### 3. Doctor Workflow
1. Create a doctor account
2. Login → Doctor Dashboard
3. View statistics (Total/Pending/Urgent scans)
4. Filter scans by priority or status
5. Click on a scan to review:
   - View retina images
   - See AI prediction
   - Update priority (low/medium/high/urgent)
   - Update status (pending/reviewed/completed)
   - Add clinical notes
6. Notes are visible to patients

---

## 📊 Database Schema

### User
- **Fields**: id, username, email, password, role (patient/nurse/doctor), full_name, phone
- **Roles**: Controls access to different dashboards and features

### RetinalScan
- **Fields**:
  - patient_id, nurse_id, doctor_id
  - ai_prediction, ai_confidence, ai_details
  - priority (low/medium/high/urgent)
  - status (pending/reviewed/completed)
  - patient_age, patient_diabetes_duration
  - created_at, updated_at

### ScanImage
- **Fields**: scan_id, image (file), eye_side (left/right/both), created_at
- **Purpose**: Stores multiple images per scan

### DoctorNote
- **Fields**: scan_id, doctor_id, note_text, created_at, updated_at
- **Purpose**: Doctor's clinical notes on scans

### PatientDoctorSubscription
- **Fields**: patient_id, doctor_id, is_active, created_at
- **Purpose**: Patient-doctor relationships

---

## 🤖 Connect Your AI Model

### Option 1: Update model_loader.py

Edit `backend/netra_backend/api/model_loader.py`:

```python
import torch
from torchvision import transforms
from PIL import Image
import io

def load_model():
    """Load your trained PyTorch model"""
    # Example: Load your actual model
    model = torch.load('path/to/your/model.pth')
    model.eval()
    return model

def predict_image(model, image_file):
    """Run inference on the uploaded image"""
    # Load image
    image = Image.open(image_file).convert('RGB')

    # Preprocess
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ])

    img_tensor = transform(image).unsqueeze(0)

    # Inference
    with torch.no_grad():
        output = model(img_tensor)

    # Convert output to prediction
    # Example: DR severity classification
    classes = ['No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR']
    probs = torch.softmax(output, dim=1)
    confidence, predicted = torch.max(probs, 1)

    return {
        'prediction': classes[predicted.item()],
        'confidence': confidence.item(),
        'all_probabilities': probs[0].tolist()
    }
```

### Option 2: Use External AI Service

If your model is hosted elsewhere:

```python
import requests

def predict_image(model, image_file):
    """Call external AI service"""
    # Upload to your AI service
    files = {'image': image_file}
    response = requests.post('YOUR_AI_SERVICE_URL/predict', files=files)

    result = response.json()
    return {
        'prediction': result['prediction'],
        'confidence': result['confidence']
    }
```

---

## 📁 Project Structure

```
netra/
├── backend/
│   └── netra_backend/
│       ├── api/
│       │   ├── models.py          # Database models
│       │   ├── views.py           # API endpoints
│       │   ├── serializers.py     # Data serialization
│       │   ├── urls.py            # URL routing
│       │   └── model_loader.py    # AI model integration
│       ├── netra_backend/
│       │   ├── settings.py        # Django settings
│       │   └── urls.py            # Main URL config
│       ├── manage.py
│       └── db.sqlite3             # Database (SQLite)
│
├── src/
│   ├── pages/
│   │   ├── Landing.tsx            # Landing page
│   │   ├── Login.tsx              # Login page
│   │   ├── Signup.tsx             # Signup page
│   │   ├── DashboardRouter.tsx    # Role-based routing
│   │   ├── PatientDashboard.tsx   # Patient portal
│   │   ├── NurseDashboard.tsx     # Nurse portal
│   │   └── DoctorDashboard.tsx    # Doctor portal
│   ├── services/
│   │   ├── djangoApi.ts           # Django API client
│   │   └── api.ts                 # Landing page API
│   ├── contexts/
│   │   ├── DjangoAuthContext.tsx  # Authentication context
│   │   └── ThemeContext.tsx       # Theme management
│   ├── components/
│   │   └── ...                    # UI components
│   └── App.tsx                    # Main app with routing
│
├── .env                           # Environment variables
├── package.json
└── vite.config.ts
```

---

## 🔐 API Endpoints Reference

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login (get JWT tokens)
- `GET /api/me/` - Get current user info

### User Management
- `GET /api/users/patient/` - List all patients
- `GET /api/users/nurse/` - List all nurses
- `GET /api/users/doctor/` - List all doctors

### Scans
- `POST /api/upload-scan/` - Upload scan (Nurse only)
- `GET /api/my-scans/` - Patient's scans
- `GET /api/nurse-scans/` - Nurse's uploads
- `GET /api/all-scans/` - Doctor's assigned scans
- `GET /api/scans/<id>/` - Scan details
- `PATCH /api/scans/<id>/update/` - Update scan (Doctor)
- `POST /api/scans/<id>/notes/` - Add note (Doctor)
- `GET /api/scan-stats/` - Statistics (Doctor)

### Subscriptions
- `GET /api/subscriptions/` - Patient's subscriptions
- `POST /api/subscribe/` - Subscribe to doctor
- `DELETE /api/subscriptions/<id>/unsubscribe/` - Unsubscribe

### Doctor Features
- `GET /api/doctor/patients/` - Subscribed patients
- `GET /api/doctor/patients/<id>/history/` - Patient history

---

## 🌐 Environment Variables

### Frontend (.env)
```
VITE_DJANGO_API_URL=http://localhost:8000/api
```

### Backend (Optional - settings.py)
```python
# For production
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']

# Use PostgreSQL
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

---

## 🐛 Troubleshooting

### Frontend Issues

**"Cannot GET /dashboard"**
- React Router is handling this. Make sure you're running `npm run dev`

**API connection fails**
- Check that Django is running on port 8000
- Verify `VITE_DJANGO_API_URL` in `.env`
- Check browser console for CORS errors

### Backend Issues

**Port 8000 already in use**
```bash
lsof -ti:8000 | xargs kill -9
# Or use a different port
python manage.py runserver 8001
```

**Database migration errors**
```bash
rm db.sqlite3
rm -rf api/migrations/000*
python manage.py makemigrations
python manage.py migrate
```

**CORS errors**
- Already configured with `CORS_ALLOW_ALL_ORIGINS = True` for development
- For production, update `settings.py` to whitelist your frontend domain

### Image Upload Issues

**Images not displaying**
- Check `MEDIA_ROOT` and `MEDIA_URL` in settings.py
- Ensure media/ directory exists
- Verify file permissions

---

## 🚀 Production Deployment

### Backend (Django)

1. **Use Gunicorn**
```bash
pip install gunicorn
gunicorn netra_backend.wsgi:application --bind 0.0.0.0:8000
```

2. **Use PostgreSQL**
```bash
pip install psycopg2-binary
```

3. **Collect static files**
```bash
python manage.py collectstatic
```

4. **Secure settings**
- Set `DEBUG = False`
- Use environment variables for secrets
- Configure `ALLOWED_HOSTS`

### Frontend (React)

1. **Build for production**
```bash
npm run build
```

2. **Serve with Nginx or deploy to:**
- Vercel
- Netlify
- AWS S3 + CloudFront

3. **Update API URL**
```
VITE_DJANGO_API_URL=https://your-api-domain.com/api
```

---

## ✨ Features Summary

### Patient Portal
- Subscribe to doctors
- View all retina scans
- See AI predictions with confidence scores
- Read doctor's clinical notes
- Beautiful scan history with filters

### Nurse Portal
- Upload left/right eye scans
- Assign scans to specific doctors
- Add patient metadata (age, diabetes duration)
- View submission history
- Track scan status updates

### Doctor Portal
- Dashboard with scan statistics
- Filter by priority (urgent/high/medium/low)
- Filter by status (pending/reviewed/completed)
- Review retina images
- Update scan priority and status
- Add clinical notes
- View patient history

---

## 🎯 Next Steps

1. ✅ **Django Backend** - Running
2. ✅ **React Frontend** - Running
3. ✅ **Create Test Users** - Via signup or admin
4. ✅ **Test Workflow** - Upload scans, review, add notes
5. 🔄 **Connect Real AI Model** - Update `model_loader.py`
6. 🔄 **Production Deploy** - Optional

---

## 📝 Notes

- Django uses SQLite by default (good for development)
- For production, switch to PostgreSQL
- AI model currently returns mock predictions
- Replace with your actual DR detection model
- All passwords are hashed with Django's built-in security
- JWT tokens expire after 24 hours (configurable)
- Images are stored in `backend/netra_backend/media/retina_scans/`

---

## 🎉 You're All Set!

The complete Netra application is ready with:
- Full-stack integration (Django ↔ React)
- Three role-based dashboards
- Complete workflow from upload → AI analysis → doctor review
- Beautiful, responsive UI
- Production-ready architecture

Just connect your AI model and you're ready to go! 🚀
