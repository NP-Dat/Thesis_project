"""
Model loading and prediction logic.

The .pkl file is loaded once (eagerly at FastAPI startup) and cached in a
module-level variable.  Every request reuses the same in-memory model.
"""

import logging
import time

import joblib
import pandas as pd

from .config import settings

logger = logging.getLogger(__name__)

_model = None
_loaded_at: float | None = None

FEATURE_COLS = ["designation", "resource_allocation", "mental_fatigue_score"]


def load_model():
    """Load the serialised model from disk and cache it."""
    global _model, _loaded_at
    logger.info("Loading model from %s", settings.MODEL_PATH)
    _model = joblib.load(settings.MODEL_PATH)
    _loaded_at = time.time()
    logger.info("Model loaded successfully")


def get_model():
    if _model is None:
        load_model()
    return _model


def get_uptime() -> float:
    """Seconds since the model was loaded, or 0 if not yet loaded."""
    if _loaded_at is None:
        return 0.0
    return round(time.time() - _loaded_at, 1)


def predict_burn_rate(
    designation: int,
    resource_allocation: float,
    mental_fatigue_score: float,
) -> float:
    """Run a single prediction and return a clamped burn rate in [0, 1]."""
    model = get_model()
    X = pd.DataFrame(
        [
            {
                "designation": designation,
                "resource_allocation": resource_allocation,
                "mental_fatigue_score": mental_fatigue_score,
            }
        ]
    )
    raw = float(model.predict(X)[0])
    return max(0.0, min(1.0, round(raw, 4)))
