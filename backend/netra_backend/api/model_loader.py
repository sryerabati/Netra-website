import os
import numpy as np

try:
    import tensorflow as tf
    from tensorflow import keras
    from PIL import Image
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️  TensorFlow not installed. Model predictions will not work.")

# ----- SETTINGS -----
IMG_SIZE = 224

# IMPORTANT: These labels MUST match the exact order used during training
# Common DR datasets use this order (APTOS 2019, EyePACS):
# 0 = No DR, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = Proliferative DR
LABELS = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']


# ----- LOAD MODEL -----
def load_model():
    """
    Loads the trained Keras model from cnn_model_best.hdf5.
    Uses CNN architecture fine-tuned for 5 classes.
    """
    if not TF_AVAILABLE:
        print("⚠️  TensorFlow not available.")
        return None

    try:
        model_path = os.path.join(os.path.dirname(__file__), "cnn_model_best.hdf5")

        if not os.path.exists(model_path):
            print(f"⚠️  Model file not found at {model_path}.")
            return None

        model = keras.models.load_model(model_path)
        print(f"✓ Model loaded successfully from {model_path}")
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")

        return model
    except Exception as e:
        print(f"⚠️  Could not load model: {e}")
        return None


# ----- IMAGE PREPROCESSING -----
def preprocess_image(image_file):
    """
    Converts uploaded image to array with same preprocessing used in training.
    Common retinal imaging preprocessing for CNN models.
    """
    if not TF_AVAILABLE:
        return None

    image = Image.open(image_file).convert("RGB")
    print(f"Original image size: {image.size}")

    # Resize to model input size
    image = image.resize((IMG_SIZE, IMG_SIZE))

    # Convert to array and normalize to [0, 1]
    img_array = np.array(image) / 255.0

    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)

    print(f"Preprocessed array shape: {img_array.shape}")
    return img_array


# ----- PREDICTION FUNCTION -----
def predict_image(model, image_file):
    """
    Runs inference on the uploaded image and returns the predicted class (0-4).
    Model outputs: 0=No DR, 1=Mild, 2=Moderate, 3=Severe, 4=Proliferative DR
    """
    if not TF_AVAILABLE or model is None:
        raise RuntimeError("Model not available. TensorFlow and model file required for predictions.")

    img_array = preprocess_image(image_file)

    predictions = model.predict(img_array, verbose=0)
    print(f"Model raw outputs: {predictions}")
    print(f"Output shape: {predictions.shape}")

    pred_class = np.argmax(predictions[0])
    confidence = predictions[0][pred_class]

    print(f"Predicted class: {pred_class} ({LABELS[pred_class]})")
    print(f"Confidence: {confidence:.4f}")

    return {
        "prediction": LABELS[pred_class],
        "prediction_class": int(pred_class),
        "confidence": float(confidence)
    }
