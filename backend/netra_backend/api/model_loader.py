import random
import os

import numpy as np
from PIL import Image, ImageOps

try:
    import torch
    import torch.nn as nn
    from torchvision import transforms
    import timm
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not installed. Using mock predictions for demo.")

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    cv2 = None

# ----- SETTINGS -----
IMG_SIZE = 224

# Dataset specific normalization statistics (computed from training set)
DATASET_MEAN = [0.356, 0.233, 0.124]
DATASET_STD = [0.276, 0.198, 0.176]

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

            # Check dimensions to determine model variant
            # B3 with width_mult 1.2: conv_stem is 40 channels (vs 32 for standard B0)
            first_weight_shape = state_dict['backbone.conv_stem.weight'].shape
            print(f"First conv layer shape: {first_weight_shape}")

            if first_weight_shape[0] == 40:
                print("Detected EfficientNet-B3 with width multiplier 1.2")
                # This matches tf_efficientnet_b3 which uses width_mult=1.2
                model = timm.create_model('tf_efficientnet_b3', pretrained=False, num_classes=5)
            else:
                print("Detected standard EfficientNet-B3")
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
def _crop_to_fundus(np_img):
    """Detect and crop the circular fundus region from the image."""
    green_channel = np_img[:, :, 1]
    threshold = max(green_channel.mean() * 0.6, 12)
    mask = green_channel > threshold

    if not mask.any():
        return np_img

    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)

    height = y1 - y0
    width = x1 - x0
    side = int(max(height, width) * 1.05)

    cy = (y0 + y1) // 2
    cx = (x0 + x1) // 2

    y_start = max(cy - side // 2, 0)
    x_start = max(cx - side // 2, 0)
    y_end = min(y_start + side, np_img.shape[0])
    x_end = min(x_start + side, np_img.shape[1])

    cropped = np_img[y_start:y_end, x_start:x_end]
    return cropped


def _apply_clahe(np_img):
    if CV2_AVAILABLE:
        lab = cv2.cvtColor(np_img, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        merged = cv2.merge((cl, a, b))
        enhanced = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)
        return enhanced

    pil_img = Image.fromarray(np_img)
    equalized = ImageOps.equalize(pil_img)
    return np.array(equalized)


def _apply_gamma(np_img, gamma=1.1):
    gamma = max(gamma, 0.01)
    inv_gamma = 1.0 / gamma
    table = np.array([(i / 255.0) ** inv_gamma * 255 for i in range(256)]).astype("uint8")
    if CV2_AVAILABLE:
        return cv2.LUT(np_img, table)
    return table[np_img]


def _quality_checks(np_img):
    qc = {}

    if CV2_AVAILABLE:
        gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    else:
        gray = np_img.mean(axis=2).astype(np.float32)
        gy, gx = np.gradient(gray)
        laplacian_var = (gx ** 2 + gy ** 2).mean()

    qc["blur_score"] = float(laplacian_var)
    qc["is_blurry"] = laplacian_var < 60.0

    brightness = float(gray.mean())
    qc["mean_brightness"] = brightness
    qc["is_too_dark"] = brightness < 40.0
    qc["is_too_bright"] = brightness > 210.0

    return qc


def preprocess_image(image_file):
    """
    Enhanced preprocessing tailored for retinal fundus images.
    Returns processed tensor and quality control information.
    """
    if not TORCH_AVAILABLE:
        return None, {}

    image = Image.open(image_file).convert("RGB")
    print(f"Original image size: {image.size}")

    np_img = np.array(image)
    np_img = _crop_to_fundus(np_img)
    np_img = _apply_clahe(np_img)
    np_img = _apply_gamma(np_img, gamma=1.1)

    qc = _quality_checks(np_img)

    processed_image = Image.fromarray(np_img)

    transform = transforms.Compose([
        transforms.Resize(IMG_SIZE + 32),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(DATASET_MEAN, DATASET_STD)
    ])

    tensor = transform(processed_image).unsqueeze(0)
    print(f"Preprocessed tensor shape: {tensor.shape}")
    return tensor, qc


# ----- PREDICTION FUNCTION -----
def predict_image(model, image_file):
    """
    Runs inference on the uploaded image and returns the predicted class (0-4).
    Model outputs: 0=No DR, 1=Mild, 2=Moderate, 3=Severe, 4=Proliferative DR
    """
    # If PyTorch is not available or model not loaded, raise error
    if not TORCH_AVAILABLE or model is None:
        raise RuntimeError("Model not available. PyTorch and model file required for predictions.")

    tensor, qc = preprocess_image(image_file)
    tensor = tensor.to(DEVICE)
    with torch.no_grad():
        outputs = model(tensor)
        print(f"Model raw outputs: {outputs}")
        print(f"Output shape: {outputs.shape}")

        # Apply softmax to get probabilities
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        print(f"Probabilities: {probabilities}")

        pred = torch.argmax(outputs, dim=1)
        pred_class = pred.item()
        confidence = probabilities[0][pred_class].item()

        print(f"Predicted class: {pred_class} ({LABELS[pred_class]})")
        print(f"Confidence: {confidence:.4f}")

    return {
        "prediction": LABELS[pred_class],
        "prediction_class": pred_class,
        "quality": qc
    }
