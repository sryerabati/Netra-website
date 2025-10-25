import os
from inspect import signature
from typing import Optional

try:
    import torch
    from torchvision import transforms
    from PIL import Image

    try:
        import timm
    except ImportError:  # pragma: no cover - optional dependency
        timm = None

    TORCH_AVAILABLE = True
except ImportError:  # pragma: no cover - executed when PyTorch is missing
    TORCH_AVAILABLE = False
    torch = None
    timm = None
    transforms = None
    Image = None
    print("⚠️  PyTorch not installed. Model predictions will not work.")

IMG_SIZE = 224

LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']
MODEL_NAME = 'efficientnet_b0'
MODEL_FILENAME = 'pytorch_model.bin'

PREPROCESS_TRANSFORM = (
    transforms.Compose(
        [
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )
    if TORCH_AVAILABLE
    else None
)


def _build_model(num_classes: int):
    """Create the EfficientNet backbone used during training."""

    if timm is not None:
        model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=num_classes)
    else:
        from torchvision import models

        model = models.efficientnet_b0(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = torch.nn.Linear(in_features, num_classes)

    return model


def _unsafe_fallback_allowed() -> bool:
    """Return whether unsafe torch.load fallback is permitted."""

    value = os.getenv("NETRA_ALLOW_UNSAFE_TORCH_LOAD", "1").strip().lower()
    return value not in {"0", "false", "no", "off"}


def _is_weights_unpickler_error(error: Exception) -> bool:
    message = str(error)
    return "WeightsUnpickler" in message or "weights_only load failed" in message


def _load_state_dict(model_path: str) -> Optional[torch.nn.Module]:
    """Load the trained PyTorch model, handling different checkpoint formats."""

    load_kwargs = {"map_location": "cpu"}

    supports_weights_only = "weights_only" in signature(torch.load).parameters

    if supports_weights_only:
        try:
            checkpoint = torch.load(model_path, weights_only=True, **load_kwargs)
        except TypeError:
            # File may contain full objects (e.g. torch.nn.Module). Fall back to default loader.
            checkpoint = torch.load(model_path, weights_only=False, **load_kwargs)
        except Exception as load_error:
            print(
                "⚠️  Could not load checkpoint safely with torch.load(weights_only=True):"
                f" {load_error}."
            )
            checkpoint = None

            if _unsafe_fallback_allowed():
                print(
                    "Attempting torch.load with weights_only=False because the checkpoint is"
                    " trusted. See https://pytorch.org/docs/stable/generated/torch.load.html"
                    " for details."
                )
                try:
                    checkpoint = torch.load(model_path, weights_only=False, **load_kwargs)
                except Exception as unsafe_error:
                    print(
                        "⚠️  Could not load checkpoint with torch.load(weights_only=False):"
                        f" {unsafe_error}."
                    )

                    if _is_weights_unpickler_error(unsafe_error):
                        print(
                            "ℹ️  If this checkpoint uses custom modules, allowlist them with"
                            " torch.serialization.add_safe_globals([...]) before loading."
                        )
    else:
        try:
            checkpoint = torch.load(model_path, weights_only=False, **load_kwargs)
        except Exception as load_error:
            print(
                "⚠️  Could not load checkpoint with torch.load(weights_only=False):"
                f" {load_error}."
            )
            checkpoint = None

    if checkpoint is None:
        # Only attempt TorchScript for files that plausibly contain scripted models.
        if model_path.endswith((".pt", ".pth", ".ts", ".jit")):
            print("Trying TorchScript loader as a fallback.")
            try:
                model = torch.jit.load(model_path, map_location='cpu')
                model.eval()
                return model
            except Exception as jit_error:
                print(f"⚠️  Could not load TorchScript model: {jit_error}")
        return None

    if isinstance(checkpoint, torch.nn.Module):
        model = checkpoint
        model.eval()
        return model

    if isinstance(checkpoint, dict):
        state_dict = checkpoint.get('state_dict') or checkpoint.get('model_state_dict') or checkpoint
    else:
        print("⚠️  Unexpected checkpoint format. Using mock predictions.")
        return None

    # Remove any 'module.' prefix left from DataParallel training
    cleaned_state_dict = {k.replace('module.', '', 1) if k.startswith('module.') else k: v for k, v in state_dict.items()}

    model = _build_model(len(LABELS))
    model.load_state_dict(cleaned_state_dict, strict=False)
    model.eval()
    return model


def load_model():
    """Load the trained PyTorch model used for diabetic retinopathy detection."""

    if not TORCH_AVAILABLE:
        print("⚠️  PyTorch not available.")
        return None

    model_path = os.path.join(os.path.dirname(__file__), MODEL_FILENAME)

    if not os.path.exists(model_path):
        print(f"⚠️  Model file not found at {model_path}.")
        return None

    model = _load_state_dict(model_path)

    if model is None:
        print("⚠️  Could not load model. Using mock predictions.")
        return None

    print(f"✓ Model loaded successfully from {model_path}")
    return model


def preprocess_image(image_file):
    """Preprocess uploaded image using the same pipeline as during training."""
    if not TORCH_AVAILABLE or PREPROCESS_TRANSFORM is None:
        return None

    image = Image.open(image_file).convert("RGB")
    print(f"Original image size: {image.size}")

    tensor = PREPROCESS_TRANSFORM(image)
    print(f"Preprocessed tensor shape: {tuple(tensor.shape)}")

    return tensor.unsqueeze(0)


def predict_image(model, image_file):
    """Run inference on the uploaded image using the PyTorch model."""

    if not TORCH_AVAILABLE or model is None:
        raise RuntimeError("Model not available. PyTorch and model file required for predictions.")

    input_tensor = preprocess_image(image_file)
    if input_tensor is None:
        raise RuntimeError("Image preprocessing failed. PyTorch is required for predictions.")

    device = torch.device('cuda' if torch and torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    input_tensor = input_tensor.to(device)

    with torch.no_grad():
        outputs = model(input_tensor)

        if hasattr(outputs, 'logits'):
            outputs = outputs.logits
        elif isinstance(outputs, (tuple, list)):
            outputs = outputs[0]

        probabilities = torch.nn.functional.softmax(outputs, dim=1)

    pred_class = int(torch.argmax(probabilities, dim=1).item())
    confidence = float(probabilities[0, pred_class].item())

    print(f"Model raw outputs: {probabilities.cpu().numpy()}")
    print(f"Predicted class: {pred_class} ({LABELS[pred_class]})")
    print(f"Confidence: {confidence:.4f}")

    return {
        "prediction": LABELS[pred_class],
        "prediction_class": pred_class,
        "confidence": confidence
    }
