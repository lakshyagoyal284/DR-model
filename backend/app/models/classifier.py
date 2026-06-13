import os
import random

import numpy as np

from app.config import settings

CLASS_NAMES = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]


class DRClassifier:
    """Singleton wrapper around the DR grading Keras model.
    Falls back to mock predictions when the .h5 file is not available.
    """

    _instance = None

    def __new__(cls) -> "DRClassifier":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
            cls._instance._mock = False
        return cls._instance

    def load(self) -> None:
        """Load the .h5 model from disk (lazy). Falls back to mock if not found."""
        if self._model is not None or self._mock:
            return
        path = settings.CLASSIFIER_MODEL_PATH
        if not os.path.exists(path):
            print(f"[classifier] Model not found at {path} — using MOCK predictions")
            self._mock = True
            return
        import tensorflow as tf
        self._model = tf.keras.models.load_model(path)
        print(f"[classifier] Model loaded from {path}")

    def predict(self, image: np.ndarray) -> dict:
        """
        Run inference on a preprocessed (224×224×3) image.
        Returns dict with grade, class_name, and confidence scores.
        Falls back to realistic mock predictions if no model is loaded.
        """
        self.load()

        if self._mock:
            return self._mock_predict()

        # Model expects batch dimension
        batch = np.expand_dims(image / 255.0, axis=0)
        preds = self._model.predict(batch, verbose=0)[0]  # shape (5,)

        grade = int(np.argmax(preds))
        confidence = float(preds[grade])

        return {
            "grade": grade,
            "class_name": CLASS_NAMES[grade],
            "confidence": confidence,
            "scores": {CLASS_NAMES[i]: float(preds[i]) for i in range(5)},
        }

    def _mock_predict(self) -> dict:
        """Return realistic-looking mock predictions for development."""
        # Weight toward "No DR" and "Moderate" (most common in practice)
        weights = [0.35, 0.10, 0.30, 0.15, 0.10]
        grade = random.choices(range(5), weights=weights, k=1)[0]

        # Generate realistic confidence scores around the chosen grade
        raw = np.random.dirichlet(np.ones(5) * 0.6)
        # Boost the chosen grade
        raw[grade] = max(raw[grade], 0.4)
        scores = raw / raw.sum()

        return {
            "grade": grade,
            "class_name": CLASS_NAMES[grade],
            "confidence": float(scores[grade]),
            "scores": {CLASS_NAMES[i]: float(scores[i]) for i in range(5)},
        }
