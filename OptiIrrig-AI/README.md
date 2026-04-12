# OptiIrrig-AI

AI/Data workspace for the OptiIrrig project.

## Scope

- Build an irrigation prediction model
- Predict whether irrigation is needed now
- Estimate recommended irrigation quantity or duration
- Prepare a leak detection workflow from sensor signals
- Expose predictions in a way that can later be connected to Laravel or the frontend

## Folder Guide

- `data/raw/`: original downloaded dataset files
- `data/processed/`: cleaned datasets ready for training
- `data/simulated/`: synthetic data for testing when real sensors are not available
- `notebooks/`: exploration, preprocessing, and modeling notebooks
- `model/preprocess.py`: builds the training table from the raw CSV files
- `model/train.py`: trains and evaluates the classifier and regressor
- `model/predict.py`: lightweight local prediction script
- `model/api.py`: FastAPI endpoint for teammate integration
- `model/saved/`: serialized models such as `.pkl` or `.joblib`

## Selected Dataset

Main dataset:

- `IoT-based Dataset of a Tomato Cultivation Under Different Irrigation Regimes`
- DOI: `10.17632/35wh56287y.2`
- Source: Mendeley Data

Why this dataset:

- Real IoT field data
- Includes air temperature, air moisture, pressure, soil moisture, soil temperature, and water volume
- Fits the irrigation recommendation use case much better than a generic classroom dataset

## Run It

1. Install dependencies

```bash
cd OptiIrrig-AI
pip install -r requirements.txt
```

2. Build the training dataset

```bash
python model/preprocess.py
```

3. Train the models

```bash
python model/train.py
```

4. Run the API

```bash
python -m uvicorn model.api:app --reload
```

5. Example prediction request

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d "{\"soil_moisture_pct\":26,\"air_temperature_c\":32,\"air_humidity_pct\":39,\"pressure_hpa\":1009.5}"
```

## Current Model Design

- Classification target: `irrigate_now`
- Regression target: `future_water_liters_1h`
- Classifier: `RandomForestClassifier`
- Regressor: `RandomForestRegressor`
- Evaluation outputs:
  - classification accuracy
  - confusion matrix plot
  - feature importance CSV
  - regression MAE and RMSE

## Suggested Next Steps

1. Explore the raw CSV files in `notebooks/01_exploration.ipynb`
2. Review the generated labels for `irrigate_now` and `future_water_liters_1h`
3. Train a first classifier and regression model
4. Save the best model in `model/saved/`
