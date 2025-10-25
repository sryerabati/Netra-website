import random
import os

try:
    import torch
    import torch.nn as nn
    from torchvision import transforms
    from PIL import Image
    import timm
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not installed. Using mock predictions for demo.")

# ----- SETTINGS -----
IMG_SIZE = 224

# IMPORTANT: These labels MUST match the exact order used during training
# Common DR datasets use this order (APTOS 2019, EyePACS):
# 0 = No DR, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = Proliferative DR
LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']

# If your training used a different order, update LABELS accordingly
# Some datasets use reverse order: [4=Proliferative, 3=Severe, 2=Moderate, 1=Mild, 0=No DR]

if TORCH_AVAILABLE:
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
else:
    DEVICE = None


# ----- LOAD MODEL -----
def load_model():
    """
    Loads the trained PyTorch model from netra_dr_best.pth.
    Uses EfficientNet architecture fine-tuned for 5 classes.
    """
    if not TORCH_AVAILABLE:
        print("⚠️  PyTorch not available. Using mock predictions.")
        return None

    try:
        model_path = os.path.join(os.path.dirname(__file__), "netra_dr_best.pth")

        if not os.path.exists(model_path):
            print(f"⚠️  Model file not found at {model_path}. Using mock predictions.")
            return None

        checkpoint = torch.load(model_path, map_location=DEVICE, weights_only=False)

        # Check if this is a full checkpoint with metadata
        if isinstance(checkpoint, dict):
            print(f"Checkpoint keys: {checkpoint.keys()}")
            if 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
            elif 'model_state_dict' in checkpoint:
                state_dict = checkpoint['model_state_dict']
            elif 'model' in checkpoint:
                state_dict = checkpoint['model']
            else:
                state_dict = checkpoint
        else:
            state_dict = checkpoint

        first_key = list(state_dict.keys())[0]
        print(f"First model key: {first_key}")

        if 'backbone' in first_key:
            print("Detected EfficientNet architecture with custom wrapper")
            model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=5)

            # Map the keys from the custom wrapper to timm's structure
            new_state_dict = {}
            for key, value in state_dict.items():
                if key.startswith('backbone.'):
                    new_key = key.replace('backbone.', '')
                    new_state_dict[new_key] = value
                elif key.startswith('head.'):
                    new_key = key.replace('head.', 'classifier.')
                    new_state_dict[new_key] = value

            missing_keys, unexpected_keys = model.load_state_dict(new_state_dict, strict=False)
            if missing_keys:
                print(f"Missing keys (will use random init): {missing_keys[:5]}...")
            if unexpected_keys:
                print(f"Unexpected keys (ignored): {unexpected_keys[:5]}...")
        else:
            print("Detected standard architecture, loading directly")
            model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=5)
            model.load_state_dict(state_dict, strict=False)

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
    Common retinal imaging preprocessing with center crop for circular fundus images.
    """
    if not TORCH_AVAILABLE:
        return None

    image = Image.open(image_file).convert("RGB")

    print(f"Original image size: {image.size}")

    # Retinal images are often circular, so we might need center cropping
    # This matches common diabetic retinopathy preprocessing pipelines
    transform = transforms.Compose([
        transforms.Resize(256),  # Resize shorter side to 256
        transforms.CenterCrop(224),  # Center crop to 224x224 to focus on fundus
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])  # ImageNet normalization
    ])
    tensor = transform(image).unsqueeze(0)
    print(f"Preprocessed tensor shape: {tensor.shape}")
    return tensor


# ----- PREDICTION FUNCTION -----
def predict_image(model, image_file):
    """
    Runs inference on the uploaded image and returns the predicted class (0-4).
    Model outputs: 0=No DR, 1=Mild, 2=Moderate, 3=Severe, 4=Proliferative DR
    """
    # If PyTorch is not available or model not loaded, raise error
    if not TORCH_AVAILABLE or model is None:
        raise RuntimeError("Model not available. PyTorch and model file required for predictions.")

    tensor = preprocess_image(image_file).to(DEVICE)
    with torch.no_grad():
        outputs = model(tensor)
        pred = torch.argmax(outputs, dim=1)
        pred_class = pred.item()

    return {
        "prediction": LABELS[pred_class],
        "prediction_class": pred_class
    }
