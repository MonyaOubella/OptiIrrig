from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np


BASE_DIR = Path(__file__).resolve().parent.parent
SAVED_DIR = BASE_DIR / "model" / "saved"
CLASSIFIER_PATH = SAVED_DIR / "irrigation_classifier.joblib"
REGRESSOR_PATH = SAVED_DIR / "irrigation_regressor.joblib"
METADATA_PATH = SAVED_DIR / "model_metadata.json"


def _load_artifacts():
    classifier = joblib.load(CLASSIFIER_PATH)
    regressor = joblib.load(REGRESSOR_PATH)
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    return classifier, regressor, metadata


def predict_irrigation(
    *,
    soil_moisture_pct: float,
    air_temperature_c: float,
    air_humidity_pct: float,
    pressure_hpa: float = 1013.0,
    soil_temperature_c: float = 24.0,
    soil_conductivity_us_cm: float = 700.0,
    air_co2_ppm: float = 500.0,
    line: int = 1,
    gdd: float = 20.0,
    standard_day_degree: float = 15.0,
    daily_mean_temperature: float = 25.0,
    daily_max_above_tbase: float = 18.0,
    daily_max_temperature: float = 31.0,
    daily_max_reduction: float = 18.0,
    ontario_units: float = 25.0,
    hour: int = 6,
    day_of_week: int = 1,
    month: int = 7,
    is_weekend: int = 0,
    soil_moisture_change_30min: float = -0.5,
    air_temperature_change_30min: float = 0.3,
) -> dict:
    classifier, regressor, metadata = _load_artifacts()
    payload = np.asarray(
        [[
            line,
            soil_conductivity_us_cm,
            soil_moisture_pct,
            soil_temperature_c,
            air_co2_ppm,
            air_humidity_pct,
            pressure_hpa,
            air_temperature_c,
            gdd,
            standard_day_degree,
            daily_mean_temperature,
            daily_max_above_tbase,
            daily_max_temperature,
            daily_max_reduction,
            ontario_units,
            hour,
            day_of_week,
            month,
            is_weekend,
            soil_moisture_change_30min,
            air_temperature_change_30min,
        ]],
        dtype=float,
    )

    irrigate_prediction = bool(classifier.predict(payload)[0])
    irrigate_probability = float(classifier.predict_proba(payload)[0][1])
    recommended_liters = float(max(regressor.predict(payload)[0], 0.0))
    liters_per_minute = float(metadata["liters_per_minute"])
    recommended_duration_min = recommended_liters / liters_per_minute

    return {
        "irrigate": irrigate_prediction,
        "confidence": round(irrigate_probability, 4),
        "recommended_liters": round(recommended_liters, 2),
        "recommended_duration_min": round(recommended_duration_min, 2),
        "reason": (
            "Low soil moisture and warm weather conditions suggest irrigation"
            if irrigate_prediction
            else "Current sensor conditions do not indicate an immediate irrigation need"
        ),
    }


if __name__ == "__main__":
    sample_prediction = predict_irrigation(
        soil_moisture_pct=26.0,
        air_temperature_c=32.0,
        air_humidity_pct=39.0,
        pressure_hpa=1009.5,
    )
    print(sample_prediction)
