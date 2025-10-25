# Database Migration Required

## Issue
You're getting "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" because the Django backend is returning an HTML error page instead of JSON. This happens when the database schema doesn't match the model changes.

## Solution

You need to apply the database migration that updates the schema to support separate predictions for each eye.

### Steps:

1. **Navigate to the Django backend directory:**
   ```bash
   cd backend/netra_backend
   ```

2. **Activate your Python virtual environment (if you have one):**
   ```bash
   # On macOS/Linux:
   source venv/bin/activate

   # On Windows:
   venv\Scripts\activate
   ```

3. **Apply the migration:**
   ```bash
   python manage.py migrate
   ```

   This will:
   - Remove the old `ai_prediction` and `ai_confidence` fields
   - Add new fields: `left_eye_prediction`, `left_eye_prediction_class`, `right_eye_prediction`, `right_eye_prediction_class`

4. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```

5. **Verify the server is running:**
   - You should see output like: "Starting development server at http://127.0.0.1:8000/"
   - The frontend expects the API at: `http://localhost:8000/api`

## What Changed

### Database Schema
- **Old:** Single `ai_prediction` field with one severity score
- **New:** Separate `left_eye_prediction` and `right_eye_prediction` fields

### AI Model Processing
- The AI model now processes each eye image **separately**
- Each eye gets its own prediction: 0=No DR, 1=Mild, 2=Moderate, 3=Severe, 4=Proliferative DR
- The model file `netra_dr_best.pth` is called twice (once per eye) when both images are uploaded

### API Response
The API now returns:
```json
{
  "left_eye_prediction": "Mild",
  "left_eye_prediction_class": 1,
  "right_eye_prediction": "No DR",
  "right_eye_prediction_class": 0
}
```

## Installing PyTorch and AI Model Dependencies

To use **real AI predictions** instead of mock predictions, you need to install PyTorch and related libraries:

1. **Install PyTorch and dependencies:**
   ```bash
   pip install torch torchvision pillow timm
   ```

   Note: `timm` is the PyTorch Image Models library required for EfficientNet architecture.

2. **Verify the model file exists:**
   The trained model should be at:
   ```
   backend/netra_backend/api/netra_dr_best.pth
   ```

3. **Restart the Django server:**
   ```bash
   python manage.py runserver
   ```

4. **Check for successful model loading:**
   You should see in the console:
   ```
   ✓ Model loaded successfully from [path]/netra_dr_best.pth
   ```

   If you see this warning, you're still using mock predictions:
   ```
   ⚠️  Could not load model: ... Using mock predictions.
   ```

## Troubleshooting

If you still get errors after migration:

1. **Check Django is running:**
   ```bash
   curl http://localhost:8000/api/
   ```

2. **Check for Python/Django installation:**
   ```bash
   python --version
   python -m django --version
   ```

3. **Install dependencies if needed:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Check the Django logs** in the terminal where you ran `runserver` for detailed error messages

5. **Verify PyTorch installation:**
   ```bash
   python -c "import torch; print(torch.__version__)"
   python -c "import timm; print(timm.__version__)"
   ```
