import random

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
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
    Loads your trained PyTorch model from a .pth file.
    Must match the same architecture you used during training.
    """
    if not TORCH_AVAILABLE:
        return None

    try:
        # Example: MobileNetV2 fine-tuned for 5 classes
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, 5)
        model.load_state_dict(torch.load("api/netra_model.pth", map_location=DEVICE))
        model.eval()
        model.to(DEVICE)
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
    Runs inference on the uploaded image and returns class + confidence.
    Uses mock predictions if PyTorch is not available (for demo/testing).
    """
    # If PyTorch is not available or model not loaded, return mock prediction
    if not TORCH_AVAILABLE or model is None:
        return {
            "prediction": random.choice(LABELS),
            "confidence": round(random.uniform(75.0, 95.0), 2)
        }

    tensor = preprocess_image(image_file).to(DEVICE)
    with torch.no_grad():
        outputs = model(tensor)
        probs = F.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)

    return {
        "prediction": LABELS[pred.item()],
        "confidence": round(float(conf.item()) * 100, 2)
    }
