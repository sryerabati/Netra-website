# IMPORTANT: AI Model Setup Instructions

## Current Status

Your model file (`netra_dr_best.pth`) uses **EfficientNet architecture**, but the system was trying to load it as MobileNetV2. This has been fixed.

## What Was Changed

The `model_loader.py` file has been updated to:
1. Use `timm` library instead of torchvision models
2. Load EfficientNet-B0 architecture
3. Map the checkpoint keys from `backbone.*` and `head.*` to the correct EfficientNet structure

## Required Installation

To use **real AI predictions** instead of mock predictions, install these dependencies:

```bash
cd backend/netra_backend
pip install torch torchvision pillow timm
```

**What each library does:**
- `torch`: PyTorch deep learning framework
- `torchvision`: Computer vision utilities
- `pillow`: Image processing (for loading retinal scan images)
- `timm`: PyTorch Image Models (provides EfficientNet-B0)

## After Installation

1. **Restart Django server:**
   ```bash
   python manage.py runserver
   ```

2. **Check console output:**

   **✅ Success - Real AI predictions:**
   ```
   Detected EfficientNet architecture
   ✓ Model loaded successfully from [path]/netra_dr_best.pth
   ```

   **⚠️ Still using mock predictions:**
   ```
   ⚠️  Could not load model: ... Using mock predictions.
   ```

## How It Works

### Without PyTorch/timm:
- Returns **random** predictions (0-4)
- Useful for testing UI and workflow
- **Not suitable for medical use**

### With PyTorch/timm:
- Loads the trained EfficientNet model
- Processes each eye image separately
- Returns real predictions based on retinal features:
  - **0**: No DR
  - **1**: Mild
  - **2**: Moderate
  - **3**: Severe
  - **4**: Proliferative DR

## Model File Location

The model file should be at:
```
backend/netra_backend/api/netra_dr_best.pth
```

This file contains the trained weights from your EfficientNet model.

## Verification

To verify everything is working:

1. **Check PyTorch installation:**
   ```bash
   python -c "import torch; print('PyTorch:', torch.__version__)"
   ```

2. **Check timm installation:**
   ```bash
   python -c "import timm; print('timm:', timm.__version__)"
   ```

3. **Test model loading:**
   ```bash
   cd backend/netra_backend
   python -c "from api.model_loader import load_model; model = load_model(); print('Model loaded:', model is not None)"
   ```
