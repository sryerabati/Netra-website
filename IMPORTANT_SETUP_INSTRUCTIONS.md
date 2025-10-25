# ⚠️ IMPORTANT: Django Backend Setup Required

## Current Status

The **frontend React app is built and ready** ✅
The **Django backend code is complete** ✅
**BUT** Django needs to be installed and started separately ❗

## Why "Failed to Fetch"?

The frontend is trying to connect to `http://localhost:8000/api` but Django isn't running yet.

---

## 🚀 Quick Fix: Start Django Backend

### Step 1: Open a New Terminal

Open a **separate terminal window** and navigate to the backend folder:

```bash
cd backend/netra_backend
```

### Step 2: Install Django (First Time Only)

```bash
# Install Django and dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow

# If pip3 is required instead:
pip3 install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
```

### Step 3: Set Up Database (First Time Only)

```bash
# Create database tables
python manage.py makemigrations
python manage.py migrate

# Create admin user (optional but recommended)
python manage.py createsuperuser
# Follow prompts to create username/password
```

### Step 4: Start Django Server

```bash
# Start the backend server
python manage.py runserver 0.0.0.0:8000
```

You should see:
```
Starting development server at http://0.0.0.0:8000/
```

### Step 5: Keep Django Running

**Important:** Keep this terminal window open with Django running!

---

## 🧪 Test the Backend

Once Django is running, test it:

```bash
# In a new terminal, test if API is working:
curl http://localhost:8000/api/users/patient/

# You should see: {"detail":"Authentication credentials were not provided."}
# This is normal - it means the API is working!
```

---

## 📱 Now Use the Frontend

With Django running:

1. **Frontend is already running** at `http://localhost:5173/`
2. Go to **http://localhost:5173/signup**
3. Create an account (choose role: patient, nurse, or doctor)
4. Login and explore your dashboard!

---

## 🔄 Complete Workflow to Test

### 1️⃣ Create Users (Signup Page)

Create 3 test accounts at `http://localhost:5173/signup`:

**Patient:**
- Username: `patient1`
- Email: `patient@test.com`
- Password: `test123`
- Full Name: `John Patient`
- Role: `Patient`

**Nurse:**
- Username: `nurse1`
- Email: `nurse@test.com`
- Password: `test123`
- Full Name: `Jane Nurse`
- Role: `Nurse`

**Doctor:**
- Username: `doctor1`
- Email: `doctor@test.com`
- Password: `test123`
- Full Name: `Dr. Smith`
- Role: `Doctor`

### 2️⃣ Patient Subscribes to Doctor

1. Login as **patient1**
2. Click "Add Doctor"
3. Subscribe to Dr. Smith
4. You'll see the doctor in "My Doctors" section

### 3️⃣ Nurse Uploads Scans

1. Logout and login as **nurse1**
2. Go to "Upload Scan" tab
3. Select patient: `John Patient`
4. Assign to doctor: `Dr. Smith`
5. Upload left/right eye images (any image file works for testing)
6. Click "Upload & Analyze Scan"
7. ✅ Scan is uploaded and AI analyzes it automatically

### 4️⃣ Doctor Reviews Scan

1. Logout and login as **doctor1**
2. You'll see the scan in your dashboard
3. Click on the scan to review
4. Update priority: `High` or `Urgent`
5. Update status: `Reviewed`
6. Add a note: "Patient shows signs of moderate DR. Schedule follow-up."
7. Click "Add Note"

### 5️⃣ Patient Views Results

1. Logout and login as **patient1**
2. View your scans in "My Scans"
3. Click on a scan to see:
   - Retina images
   - AI prediction
   - Doctor's notes
   - Priority and status

---

## 🐛 Troubleshooting

### "Failed to Fetch" Error

**Cause:** Django backend is not running

**Solution:**
```bash
cd backend/netra_backend
python manage.py runserver 0.0.0.0:8000
```

### "Port 8000 already in use"

**Solution:**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001

# Then update frontend .env:
VITE_DJANGO_API_URL=http://localhost:8001/api
```

### Django not found

**Solution:**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
```

### Can't create migrations

**Solution:**
```bash
# Delete old database and start fresh
rm db.sqlite3
rm -rf api/migrations/000*
python manage.py makemigrations
python manage.py migrate
```

---

## 📚 API Documentation

Once Django is running, you can test API endpoints:

### Register a User
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }'
```

This returns JWT tokens that the frontend uses automatically.

---

## 🎯 Summary

**Two Servers Must Run:**

1. **Django Backend** (Terminal 1)
   ```bash
   cd backend/netra_backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **React Frontend** (Terminal 2 - already running)
   ```bash
   npm run dev
   ```

Keep both terminals open while using the app!

---

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Django Backend
cd backend/netra_backend
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# Terminal 2 - React Frontend (already done)
npm run dev
```

Visit: **http://localhost:5173/**

---

## ✅ When Everything Works

You'll see:
- ✅ No "Failed to Fetch" errors
- ✅ Can signup and login
- ✅ Patient, Nurse, and Doctor dashboards working
- ✅ Can upload scans
- ✅ Can review scans
- ✅ Can add notes

Ready to go! 🎉
