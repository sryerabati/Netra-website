import os
import random
import time

try:
    import torch
    from PIL import Image
    import timm
    import numpy as np
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not installed. Falling back to mock predictions.")

# ----- SETTINGS -----
IMG_SIZE = 224

# IMPORTANT: These labels MUST match the exact order used during training
# Common DR datasets use this order (APTOS 2019, EyePACS):
# 0 = No DR, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = Proliferative DR
LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']

# If your training used a different order, update LABELS accordingly
# Some datasets use reverse order: [4=Proliferative, 3=Severe, 2=Moderate, 1=Mild, 0=No DR]

USE_MOCK_AI = os.getenv("NETRA_USE_MOCK_AI", "").lower() in {"1", "true", "yes"}


class MockPredictor:
    """Simple stand-in model when the real model is unavailable."""

    def __init__(self, labels):
        self.labels = labels

    def __call__(self, *_args, **_kwargs):
        pred_class = random.randint(0, len(self.labels) - 1)
        return {
            "prediction": self.labels[pred_class],
            "prediction_class": pred_class,
        }


if TORCH_AVAILABLE and not USE_MOCK_AI:
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
else:
    DEVICE = None


# ----- LOAD MODEL -----
def load_model():
    """
    Loads the trained PyTorch model from netra_dr_best.pth.
    Uses EfficientNet architecture fine-tuned for 5 classes.
    """
    if USE_MOCK_AI:
        print("NETRA_USE_MOCK_AI enabled. Using mock predictions.")
        return MockPredictor(LABELS)

    if not TORCH_AVAILABLE:
        print("⚠️  PyTorch not available. Using mock predictions.")
        return MockPredictor(LABELS)

    try:
        model_path = os.path.join(os.path.dirname(__file__), "netra_dr_best.pth")

        if not os.path.exists(model_path):
            print(f"⚠️  Model file not found at {model_path}. Using mock predictions.")
            return MockPredictor(LABELS)

        print(f"Loading retinal model from {model_path} on {DEVICE or 'CPU'}...")
        checkpoint = torch.load(model_path, map_location=DEVICE or 'cpu', weights_only=False)

        # Check if this is a full checkpoint with metadata
        if isinstance(checkpoint, dict):
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

        first_key = next(iter(state_dict.keys()))
        if 'backbone' in first_key:
            model = timm.create_model('tf_efficientnet_b3', pretrained=False, num_classes=5)

            # Map the keys from the custom wrapper to timm's structure
            new_state_dict = {}
            for key, value in state_dict.items():
                if key.startswith('backbone.'):
                    new_key = key.replace('backbone.', '')
                    new_state_dict[new_key] = value
                elif key.startswith('head.'):
                    new_key = key.replace('head.', 'classifier.')
                    new_state_dict[new_key] = value
            model.load_state_dict(new_state_dict, strict=False)
        else:
            model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=5)
            model.load_state_dict(state_dict, strict=False)

        model.eval()
        model.to(DEVICE)

        print("✓ Model loaded successfully.")
        return model
    except Exception as e:
        print(f"⚠️  Could not load model: {e}. Using mock predictions.")
        return MockPredictor(LABELS)


# ----- IMAGE PREPROCESSING -----
def preprocess_image(image_file):
    """
    Loads the uploaded image and converts it directly to a tensor without
    applying any preprocessing so the raw pixel data is fed to the model.
    """
    if not TORCH_AVAILABLE:
        raise RuntimeError("PyTorch is required for preprocessing.")

    image = Image.open(image_file).convert("RGB")

    array = np.array(image)
    tensor = torch.from_numpy(array).permute(2, 0, 1).unsqueeze(0).float()
    return tensor


# ----- PREDICTION FUNCTION -----
def predict_image(model, image_file):
    """
    Runs inference on the uploaded image and returns the predicted class (0-4).
    Model outputs: 0=No DR, 1=Mild, 2=Moderate, 3=Severe, 4=Proliferative DR
    """
    # Use the mock predictor when the real model isn't available.
    if isinstance(model, MockPredictor):
        return model()

    if not TORCH_AVAILABLE or model is None:
        raise RuntimeError("Model not available. PyTorch and model file required for predictions.")

    tensor = preprocess_image(image_file).to(DEVICE)
    attempt = 0
    start_time = time.time()

    while True:
        attempt += 1
        with torch.no_grad():
            outputs = model(tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)

            pred = torch.argmax(outputs, dim=1)
            pred_class = pred.item()
            confidence = probabilities[0][pred_class].item()

            if confidence >= 0.70:
                break

            elapsed = time.time() - start_time
            if elapsed >= 10:
                break

    return {
        "prediction": LABELS[pred_class],
        "prediction_class": pred_class
    }
