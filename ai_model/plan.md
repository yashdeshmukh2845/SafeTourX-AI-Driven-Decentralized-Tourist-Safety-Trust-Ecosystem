# Stage 2: AI Risk Prediction Module

## Goal
Create a Python-based microservice that predicts safety risk scores based on location, time, and crime rate data.

## Plan
1.  **Setup**: Python venv, install `scikit-learn`, `pandas`, `flask`, `numpy`.
2.  **Training Script (`train_model.py`)**:
    - Generate dummy dataset (1000 samples).
    - Features: `crime_rate` (0-100), `latitude`, `longitude`, `hour` (0-23).
    - Target: `risk_score` (0: Low, 1: Medium, 2: High).
    - Train Random Forest Classifier.
    - Save model to `risk_model.pkl`.
3.  **API Service (`app.py`)**:
    - Load `risk_model.pkl` on startup.
    - Endpoint: `POST /predict`.
    - Input: JSON `{ "crime_rate": 50, "lat": 12.34, "lon": 56.78, "hour": 20 }`.
    - Output: JSON `{ "risk_level": "High", "score": 2 }`.

## Files
- `ai_model/requirements.txt`
- `ai_model/train_model.py`
- `ai_model/app.py`
