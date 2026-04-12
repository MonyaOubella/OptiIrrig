from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .predict import predict_irrigation


app = FastAPI(title="OptiIrrig AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    soil_moisture_pct: float = Field(..., description="Soil moisture percentage")
    air_temperature_c: float = Field(..., description="Air temperature in Celsius")
    air_humidity_pct: float = Field(..., description="Air humidity percentage")
    pressure_hpa: float = Field(1013.0, description="Air pressure in hPa")
    soil_temperature_c: float = Field(24.0, description="Soil temperature in Celsius")
    line: int = Field(1, description="Irrigation line identifier")
    hour: int = Field(6, description="Hour of day from 0 to 23")
    day_of_week: int = Field(1, description="Day of week from 0 to 6")
    month: int = Field(7, description="Month number from 1 to 12")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict")
def predict(payload: PredictionRequest) -> dict:
    return predict_irrigation(**payload.model_dump())
