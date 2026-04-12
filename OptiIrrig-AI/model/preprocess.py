from __future__ import annotations

import csv
from bisect import bisect_left
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean


BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DATASET_DIR = (
    BASE_DIR
    / "data"
    / "raw"
    / "iot_tomato_irrigation_dataset"
    / "IoT-based Dataset of a Tomato Cultivation Under Different Irrigation Regimes"
)
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DATA_PATH = PROCESSED_DIR / "irrigation_training_data.csv"

TIME_WINDOW_STEPS = 6
IRRIGATION_THRESHOLD_LITERS = 10.0
MAX_JOIN_DELTA_MS = 10 * 60 * 1000

FIELDNAMES = [
    "timestamp_ms",
    "timestamp_iso",
    "date",
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
    "water_delta_liters",
    "future_water_liters_1h",
    "recommended_duration_min",
    "irrigate_now",
]


def parse_float(value: str) -> float | None:
    if value in {"", "NULL", None}:
        return None
    return float(value)


def parse_int(value: str) -> int:
    return int(float(value))


def is_number(value: str) -> bool:
    try:
        float(value)
        return True
    except (TypeError, ValueError):
        return False


def timestamp_to_iso(timestamp_ms: int) -> str:
    dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc).replace(tzinfo=None)
    return dt.isoformat(sep=" ")


def timestamp_to_date(timestamp_ms: int) -> str:
    return datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc).strftime("%Y-%m-%d")


def load_environmental() -> tuple[list[int], dict[int, dict[str, float]]]:
    path = RAW_DATASET_DIR / "stuard_environmental_data.csv"
    grouped: dict[int, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if not is_number(row["ts_generation"]):
                continue
            ts = parse_int(row["ts_generation"])
            for target, source in {
                "air_co2_ppm": "co2",
                "air_humidity_pct": "humidity",
                "pressure_hpa": "pressure",
                "air_temperature_c": "temperature",
            }.items():
                value = parse_float(row[source])
                if value is not None:
                    grouped[ts][target].append(value)

    timestamps = sorted(grouped)
    aggregated = {
        ts: {name: mean(values) for name, values in measurements.items()}
        for ts, measurements in grouped.items()
    }
    return timestamps, aggregated


def load_indicators() -> dict[str, dict[str, float]]:
    path = RAW_DATASET_DIR / "indicators.csv"
    indicators: dict[str, dict[str, float]] = {}
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if not is_number(row[""]):
                continue
            timestamp_ms = parse_int(row[""])
            indicators[timestamp_to_date(timestamp_ms)] = {
                "gdd": parse_float(row["gdd"]) or 0.0,
                "standard_day_degree": parse_float(row["standard_day_degree"]) or 0.0,
                "daily_mean_temperature": parse_float(row["daily_mean_temperature"]) or 0.0,
                "daily_max_above_tbase": parse_float(row["daily_max_above_Tbase"]) or 0.0,
                "daily_max_temperature": parse_float(row["daily_max"]) or 0.0,
                "daily_max_reduction": parse_float(row["daily_max_reduction"]) or 0.0,
                "ontario_units": parse_float(row["ontario_units"]) or 0.0,
            }
    return indicators


def load_water() -> tuple[dict[int, list[int]], dict[int, dict[int, dict[str, float]]]]:
    path = RAW_DATASET_DIR / "stuard_water_meter_data.csv"
    rows_by_line: dict[int, list[dict[str, float]]] = defaultdict(list)
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if not is_number(row["line"]) or not is_number(row["ts_generation"]):
                continue
            line = parse_int(row["line"])
            rows_by_line[line].append(
                {
                    "timestamp_ms": parse_int(row["ts_generation"]),
                    "water_volume_m3": parse_float(row["current_volume"]) or 0.0,
                }
            )

    timestamps_by_line: dict[int, list[int]] = {}
    values_by_line: dict[int, dict[int, dict[str, float]]] = {}

    for line, rows in rows_by_line.items():
        rows.sort(key=lambda item: item["timestamp_ms"])
        deltas: list[float] = []
        previous_volume = None
        for item in rows:
            current_volume = item["water_volume_m3"]
            delta_m3 = 0.0 if previous_volume is None else max(current_volume - previous_volume, 0.0)
            previous_volume = current_volume
            deltas.append(delta_m3 * 1000.0)

        future_liters: list[float] = []
        for index in range(len(rows)):
            future_liters.append(sum(deltas[index + 1 : index + 1 + TIME_WINDOW_STEPS]))

        timestamps_by_line[line] = [int(item["timestamp_ms"]) for item in rows]
        values_by_line[line] = {}
        for item, delta_liters, future in zip(rows, deltas, future_liters):
            ts = int(item["timestamp_ms"])
            values_by_line[line][ts] = {
                "water_volume_m3": item["water_volume_m3"],
                "water_delta_liters": delta_liters,
                "future_water_liters_1h": future,
                "irrigate_now": 1 if future >= IRRIGATION_THRESHOLD_LITERS else 0,
                "recommended_duration_min": max(future / 10.0, 0.0),
            }
    return timestamps_by_line, values_by_line


def load_soil() -> dict[int, list[dict[str, float]]]:
    path = RAW_DATASET_DIR / "stuard_soil_data.csv"
    rows_by_line: dict[int, list[dict[str, float]]] = defaultdict(list)
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if not is_number(row["line"]) or not is_number(row["ts_generation"]):
                continue
            line = parse_int(row["line"])
            rows_by_line[line].append(
                {
                    "timestamp_ms": parse_int(row["ts_generation"]),
                    "line": line,
                    "soil_conductivity_us_cm": parse_float(row["electrical_conductivity"]) or 0.0,
                    "soil_moisture_pct": parse_float(row["humidity"]) or 0.0,
                    "soil_temperature_c": parse_float(row["temperature"]) or 0.0,
                }
            )

    for rows in rows_by_line.values():
        rows.sort(key=lambda item: item["timestamp_ms"])
    return rows_by_line


def nearest_value(
    target_ts: int,
    timestamps: list[int],
    values_map: dict[int, dict[str, float]],
    max_delta_ms: int = MAX_JOIN_DELTA_MS,
) -> dict[str, float] | None:
    if not timestamps:
        return None
    index = bisect_left(timestamps, target_ts)
    candidate_indices = []
    if index < len(timestamps):
        candidate_indices.append(index)
    if index > 0:
        candidate_indices.append(index - 1)
    best_ts = None
    best_delta = None
    for candidate_index in candidate_indices:
        ts = timestamps[candidate_index]
        delta = abs(ts - target_ts)
        if best_delta is None or delta < best_delta:
            best_ts = ts
            best_delta = delta
    if best_ts is None or best_delta is None or best_delta > max_delta_ms:
        return None
    return values_map[best_ts]


def build_training_rows() -> list[dict[str, float | int | str]]:
    env_timestamps, env_values = load_environmental()
    indicators_by_date = load_indicators()
    water_timestamps_by_line, water_values_by_line = load_water()
    soil_by_line = load_soil()

    training_rows: list[dict[str, float | int | str]] = []

    for line, soil_rows in soil_by_line.items():
        for index, soil_row in enumerate(soil_rows):
            timestamp_ms = int(soil_row["timestamp_ms"])
            date_key = timestamp_to_date(timestamp_ms)
            env_row = nearest_value(timestamp_ms, env_timestamps, env_values)
            water_row = nearest_value(
                timestamp_ms,
                water_timestamps_by_line.get(line, []),
                water_values_by_line.get(line, {}),
            )
            indicator_row = indicators_by_date.get(date_key)

            if env_row is None or water_row is None or indicator_row is None:
                continue

            dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
            previous_soil = soil_rows[index - 3]["soil_moisture_pct"] if index >= 3 else soil_rows[0]["soil_moisture_pct"]
            previous_air = env_row["air_temperature_c"]

            if index >= 3:
                prev_env = nearest_value(
                    int(soil_rows[index - 3]["timestamp_ms"]),
                    env_timestamps,
                    env_values,
                )
                if prev_env is not None:
                    previous_air = prev_env["air_temperature_c"]

            training_rows.append(
                {
                    "timestamp_ms": timestamp_ms,
                    "timestamp_iso": timestamp_to_iso(timestamp_ms),
                    "date": date_key,
                    "line": line,
                    "soil_conductivity_us_cm": soil_row["soil_conductivity_us_cm"],
                    "soil_moisture_pct": soil_row["soil_moisture_pct"],
                    "soil_temperature_c": soil_row["soil_temperature_c"],
                    "air_co2_ppm": env_row["air_co2_ppm"],
                    "air_humidity_pct": env_row["air_humidity_pct"],
                    "pressure_hpa": env_row["pressure_hpa"],
                    "air_temperature_c": env_row["air_temperature_c"],
                    "gdd": indicator_row["gdd"],
                    "standard_day_degree": indicator_row["standard_day_degree"],
                    "daily_mean_temperature": indicator_row["daily_mean_temperature"],
                    "daily_max_above_tbase": indicator_row["daily_max_above_tbase"],
                    "daily_max_temperature": indicator_row["daily_max_temperature"],
                    "daily_max_reduction": indicator_row["daily_max_reduction"],
                    "ontario_units": indicator_row["ontario_units"],
                    "hour": dt.hour,
                    "day_of_week": dt.weekday(),
                    "month": dt.month,
                    "is_weekend": 1 if dt.weekday() >= 5 else 0,
                    "soil_moisture_change_30min": soil_row["soil_moisture_pct"] - previous_soil,
                    "air_temperature_change_30min": env_row["air_temperature_c"] - previous_air,
                    "water_delta_liters": water_row["water_delta_liters"],
                    "future_water_liters_1h": water_row["future_water_liters_1h"],
                    "recommended_duration_min": water_row["recommended_duration_min"],
                    "irrigate_now": water_row["irrigate_now"],
                }
            )
    training_rows.sort(key=lambda item: (int(item["timestamp_ms"]), int(item["line"])))
    return training_rows


def write_training_csv(rows: list[dict[str, float | int | str]]) -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    with PROCESSED_DATA_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    rows = build_training_rows()
    write_training_csv(rows)
    print(f"Saved processed training data to: {PROCESSED_DATA_PATH}")
    print(f"Rows: {len(rows)}")
    print(f"Columns: {len(FIELDNAMES)}")
    for row in rows[:3]:
        print(row)


if __name__ == "__main__":
    main()
