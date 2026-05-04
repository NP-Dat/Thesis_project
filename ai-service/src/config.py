from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    MODEL_PATH: str = str(_BASE_DIR / "model" / "burnout_model.pkl")
    MODEL_NAME: str = "random_forest_v1"
    DATASET_PATH: str = str(_BASE_DIR.parent / "archive" / "employee_burnout_analysis-AI.xlsx")
    LOG_LEVEL: str = "info"


settings = Settings()
