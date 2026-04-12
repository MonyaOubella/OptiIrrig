from __future__ import annotations

import csv
import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import ConfusionMatrixDisplay, accuracy_score, mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DATA_PATH = BASE_DIR / "data" / "processed" / "irrigation_training_data.csv"
SAVED_DIR = BASE_DIR / "model" / "saved"

CLASSIFIER_PATH = SAVED_DIR / "irrigation_classifier.joblib"
REGRESSOR_PATH = SAVED_DIR / "irrigation_regressor.joblib"
METADATA_PATH = SAVED_DIR / "model_metadata.json"
FEATURE_IMPORTANCE_PATH = SAVED_DIR / "feature_importance.csv"
CONFUSION_MATRIX_PATH = SAVED_DIR / "confusion_matrix.png"

FEATURE_COLUMNS = [
    "line",
    "soil_conductivity_us_cm",
    "soil_moisture_pct",
    "soil_temperature_c",
    "air_co2_ppm",
    "air_humidity_pct",
    "pressure_hpa",
    "air_temperature_c",
    "gdd",
    "standard_day_degree",
    "daily_mean_temperature",
    "daily_max_above_tbase",
    "daily_max_temperature",
    "daily_max_reduction",
    "ontario_units",
    "hour",
    "day_of_week",
    "month",
    "is_weekend",
    "soil_moisture_change_30min",
    "air_temperature_change_30min",
]


def load_training_data() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    if not PROCESSED_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Processed dataset not found at {PROCESSED_DATA_PATH}. Run preprocess.py first."
        )

    features: list[list[float]] = []
    target_class: list[int] = []
    target_reg: list[float] = []
    water_deltas: list[float] = []
    timestamps: list[int] = []

    with PROCESSED_DATA_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            features.append([float(row[column]) for column in FEATURE_COLUMNS])
            target_class.append(int(row["irrigate_now"]))
            target_reg.append(float(row["future_water_liters_1h"]))
            water_deltas.append(float(row["water_delta_liters"]))
            timestamps.append(int(row["timestamp_ms"]))

    x = np.asarray(features, dtype=float)
    y_class = np.asarray(target_class, dtype=int)
    y_reg = np.asarray(target_reg, dtype=float)
    water_delta = np.asarray(water_deltas, dtype=float)
    timestamps_arr = np.asarray(timestamps, dtype=np.int64)
    order = np.argsort(timestamps_arr)
    return x[order], y_class[order], y_reg[order], water_delta[order]


def build_classifier() -> Pipeline:
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=250,
                    max_depth=12,
                    min_samples_leaf=2,
                    random_state=42,
                    n_jobs=1,
                ),
            ),
        ]
    )


def build_regressor() -> Pipeline:
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            (
                "model",
                RandomForestRegressor(
                    n_estimators=250,
                    max_depth=12,
                    min_samples_leaf=2,
                    random_state=42,
                    n_jobs=1,
                ),
            ),
        ]
    )


def save_confusion_matrix(classifier: Pipeline, x_test: np.ndarray, y_test: np.ndarray) -> None:
    disp = ConfusionMatrixDisplay.from_estimator(classifier, x_test, y_test)
    disp.figure_.savefig(CONFUSION_MATRIX_PATH, dpi=160, bbox_inches="tight")
    plt.close(disp.figure_)


def save_feature_importance(classifier: Pipeline) -> None:
    importances = classifier.named_steps["model"].feature_importances_
    with FEATURE_IMPORTANCE_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["feature", "importance"])
        for feature, importance in sorted(zip(FEATURE_COLUMNS, importances), key=lambda item: item[1], reverse=True):
            writer.writerow([feature, f"{importance:.8f}"])


def main() -> None:
    SAVED_DIR.mkdir(parents=True, exist_ok=True)
    x, y_class, y_reg, water_delta = load_training_data()

    cutoff = int(len(x) * 0.8)
    x_train, x_test = x[:cutoff], x[cutoff:]
    y_class_train, y_class_test = y_class[:cutoff], y_class[cutoff:]
    y_reg_train, y_reg_test = y_reg[:cutoff], y_reg[cutoff:]

    classifier = build_classifier()
    classifier.fit(x_train, y_class_train)
    class_predictions = classifier.predict(x_test)
    class_accuracy = accuracy_score(y_class_test, class_predictions)

    regressor = build_regressor()
    regressor.fit(x_train, y_reg_train)
    reg_predictions = regressor.predict(x_test)
    mae = mean_absolute_error(y_reg_test, reg_predictions)
    rmse = mean_squared_error(y_reg_test, reg_predictions) ** 0.5

    positive_flow = water_delta[water_delta > 0]
    liters_per_minute = float(np.median(positive_flow) / 10.0) if positive_flow.size else 10.0
    liters_per_minute = max(liters_per_minute, 0.1)

    metadata = {
        "feature_columns": FEATURE_COLUMNS,
        "classification_accuracy": round(float(class_accuracy), 4),
        "regression_mae_liters": round(float(mae), 4),
        "regression_rmse_liters": round(float(rmse), 4),
        "liters_per_minute": round(liters_per_minute, 4),
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
        "target_definition": {
            "irrigate_now": "1 if the next hour of cumulative applied water is at least 10 liters for the same irrigation line",
            "future_water_liters_1h": "Sum of positive water meter increments over the next six 10-minute steps",
        },
    }

    joblib.dump(classifier, CLASSIFIER_PATH)
    joblib.dump(regressor, REGRESSOR_PATH)
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    save_feature_importance(classifier)
    save_confusion_matrix(classifier, x_test, y_class_test)

    print(f"Classifier saved to: {CLASSIFIER_PATH}")
    print(f"Regressor saved to: {REGRESSOR_PATH}")
    print(f"Classification accuracy: {class_accuracy:.4f}")
    print(f"Regression MAE (liters): {mae:.4f}")
    print(f"Regression RMSE (liters): {rmse:.4f}")
    print(f"Confusion matrix saved to: {CONFUSION_MATRIX_PATH}")
    print(f"Feature importance saved to: {FEATURE_IMPORTANCE_PATH}")


if __name__ == "__main__":
    main()
