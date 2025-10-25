import random
import os

try:
    import torch
    import torch.nn as nn
    from torchvision import models, transforms
    from PIL import Image
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not installed. Using mock predictions for demo.")

# ----- SETTINGS -----
IMG_SIZE = 224
LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']

if TORCH_AVAILABLE:
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
else:
    DEVICE = None


# ----- LOAD MODEL -----
def load_model():
    """
    Loads the trained PyTorch model from netra_dr_best.pth.
    Uses MobileNetV2 architecture fine-tuned for 5 classes.
    """
    if not TORCH_AVAILABLE:
        print("⚠️  PyTorch not available. Using mock predictions.")
        return None

    try:
        model_path = os.path.join(os.path.dirname(__file__), "netra_dr_best.pth")

        if not os.path.exists(model_path):
            print(f"⚠️  Model file not found at {model_path}. Using mock predictions.")
            return None

        # MobileNetV2 architecture for 5-class classification
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, 5)

        # Load the trained weights
        model.load_state_dict(torch.load(model_path, map_location=DEVICE))
        model.eval()
        model.to(DEVICE)

        print(f"✓ Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(f"⚠️  Could not load model: {e}. Using mock predictions.")
        return None


# ----- IMAGE PREPROCESSING -----
def preprocess_image(image_file):
    """
    Converts uploaded image to tensor with same preprocessing used in training.
    """
    if not TORCH_AVAILABLE:
        return None

    image = Image.open(image_file).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])  # ImageNet normalization
    ])
    return transform(image).unsqueeze(0)  # Shape: (1, 3, 224, 224)


# ----- PREDICTION FUNCTION -----
def predict_image(model, image_file):
    """
    Runs inference on the uploaded image and returns the predicted class (0-4).
    Model outputs: 0=No DR, 1=Mild, 2=Moderate, 3=Severe, 4=Proliferative DR
    Uses mock predictions if PyTorch is not available (for demo/testing).
    """
    # If PyTorch is not available or model not loaded, return mock prediction
    if not TORCH_AVAILABLE or model is None:
        pred_class = random.randint(0, 4)
        return {
            "prediction": LABELS[pred_class],
            "prediction_class": pred_class
        }

    try:
        tensor = preprocess_image(image_file).to(DEVICE)
        with torch.no_grad():
            outputs = model(tensor)
            pred = torch.argmax(outputs, dim=1)
            pred_class = pred.item()

        return {
            "prediction": LABELS[pred_class],
            "prediction_class": pred_class
        }
    except Exception as e:
        print(f"⚠️  Prediction error: {e}. Using fallback.")
        pred_class = random.randint(0, 4)
        return {
            "prediction": LABELS[pred_class],
            "prediction_class": pred_class
        }
