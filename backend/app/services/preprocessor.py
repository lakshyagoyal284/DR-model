import cv2
import numpy as np

from app.config import settings


def circle_crop(img: np.ndarray, tol: int = 7) -> np.ndarray:
    """Crop a fundus image to the circular retina region."""
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    mask = gray > tol
    if mask.sum() == 0:
        return img
    coords = np.argwhere(mask)
    y0, x0 = coords.min(0)
    y1, x1 = coords.max(0) + 1
    return img[y0:y1, x0:x1]


def clahe_rgb(img: np.ndarray) -> np.ndarray:
    """Apply CLAHE (contrast-limited adaptive histogram equalization) on RGB."""
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2RGB)


def preprocess_fundus(image_bytes: bytes, size: int | None = None) -> np.ndarray:
    """
    Decode raw image bytes → circle-crop → (optional CLAHE) → resize.
    Returns a float32 array with values in [0, 255].
    """
    if size is None:
        size = settings.CLS_IMG_SIZE

    # Decode from bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image bytes")

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = circle_crop(img)
    img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)

    if settings.USE_CLAHE:
        img = clahe_rgb(img)

    return img.astype(np.float32)
