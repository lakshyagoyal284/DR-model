import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "DR Detection API"
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://dr_user:dr_pass@localhost:5432/dr_detection",
    )

    # Model paths
    CLASSIFIER_MODEL_PATH: str = os.getenv(
        "CLASSIFIER_MODEL_PATH", "saved_models/dr_classifier.h5"
    )
    SEGMENTER_MODEL_PATH: str = os.getenv(
        "SEGMENTER_MODEL_PATH", "saved_models/dr_segmenter.h5"
    )

    # Image settings
    CLS_IMG_SIZE: int = 224
    SEG_IMG_SIZE: int = 384
    USE_CLAHE: bool = True

    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")


settings = Settings()
