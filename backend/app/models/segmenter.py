import base64
import os
import random

import cv2
import numpy as np

from app.config import settings


class DRSegmenter:
    """Singleton wrapper around the U-Net segmentation Keras model.
    Falls back to a simulated mask when the .h5 file is not available.
    """

    _instance = None

    def __new__(cls) -> "DRSegmenter":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
            cls._instance._mock = False
        return cls._instance

    def load(self) -> None:
        """Load the .h5 model from disk (lazy). Falls back to mock if not found."""
        if self._model is not None or self._mock:
            return
        path = settings.SEGMENTER_MODEL_PATH
        if not os.path.exists(path):
            print(f"[segmenter] Model not found at {path} — using MOCK segmentation")
            self._mock = True
            return
        import tensorflow as tf
        self._model = tf.keras.models.load_model(path)
        print(f"[segmenter] Model loaded from {path}")

    def _generate_mock_mask(self, h: int, w: int) -> np.ndarray:
        """Generate a simple simulated lesion mask for development."""
        mask = np.zeros((h, w), dtype=np.uint8)
        # Draw a few random blobs to simulate lesions
        for _ in range(random.randint(1, 4)):
            cx, cy = random.randint(0, w), random.randint(0, h)
            rx, ry = random.randint(10, 60), random.randint(10, 60)
            mask = cv2.ellipse(mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
        return mask

    def predict(self, image: np.ndarray) -> dict:
        """
        Run segmentation on a preprocessed (384×384×3) image.
        Returns lesion mask as a base64 PNG and overlay as base64.
        Falls back to a simulated mask if no model is loaded.
        """
        self.load()

        h, w = image.shape[:2]

        if self._mock:
            mask_resized = self._generate_mock_mask(h, w)
        else:
            # Resize to model input size
            resized = cv2.resize(image, (settings.SEG_IMG_SIZE, settings.SEG_IMG_SIZE))
            batch = np.expand_dims(resized / 255.0, axis=0)

            mask = self._model.predict(batch, verbose=0)[0]  # shape (H, W, C)
            mask_binary = (mask.squeeze() > 0.5).astype(np.uint8) * 255

            # Resize mask back to original dimensions
            mask_resized = cv2.resize(mask_binary, (w, h))

        # Encode mask to PNG bytes → base64
        _, mask_buffer = cv2.imencode(".png", mask_resized)
        mask_b64 = base64.b64encode(mask_buffer.tobytes()).decode("utf-8")

        # Create overlay (red-tinted)
        overlay = image.copy()
        overlay[:, :, 0] = np.where(mask_resized > 0, 255, overlay[:, :, 0])
        _, overlay_buffer = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        overlay_b64 = base64.b64encode(overlay_buffer.tobytes()).decode("utf-8")

        return {
            "mask": mask_b64,
            "overlay": overlay_b64,
            "width": w,
            "height": h,
        }
