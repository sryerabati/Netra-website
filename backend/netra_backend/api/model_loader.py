import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import io

# ----- SETTINGS -----
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']


# ----- LOAD MODEL -----
def load_model():
    """
    Loads your trained PyTorch model from a .pth file.
    Must match the same architecture you used during training.
    """
    # Example: MobileNetV2 fine-tuned for 5 classes
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, 5)
    model.load_state_dict(torch.load("api/netra_model.pth", map_location=DEVICE))
    model.eval()
    model.to(DEVICE)
    return model


# ----- IMAGE PREPROCESSING -----
def preprocess_image(image_file):
    """
    Converts uploaded image to tensor with same preprocessing used in training.
    """
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
    """
    tensor = preprocess_image(image_file).to(DEVICE)
    with torch.no_grad():
        outputs = model(tensor)
        probs = F.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)

    return {
        "prediction": LABELS[pred.item()],
        "confidence": round(float(conf.item()) * 100, 2)
    }
