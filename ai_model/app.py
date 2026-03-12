from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load Model
try:
    model = joblib.load('risk_model.pkl')
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Model not found or error loading: {e}. Please run train_model.py first.")
    model = None

# Risk Labels Mapping (Must match training mapping)
RISK_LABELS = {0: 'Low', 1: 'Medium', 2: 'High', 3: 'Very High'}

@app.route('/', methods=['GET'])
def index():
    return "SafeTourX AI Risk Module (Maharashtra Edition) Running..."

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()
        
        # Inputs: lat, lon, hour (optional, default to now)
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        hour = data.get('hour')

        if hour is None:
            # Default to model avg or specific time? Let's use 12 if not provided, or better, current server time?
            # For simplicity, default to 20 (8 PM - higher risk assumption) or 12.
            hour = 20 
        else:
            hour = int(hour)

        features = pd.DataFrame([[lat, lon, hour]], columns=['Latitude', 'Longitude', 'Hour'])
        
        # Predict Probabilities
        probs = model.predict_proba(features)[0] # [P(0), P(1), P(2), P(3)]
        
        # Calculate Weighted Risk Score (0-100%)
        # 0=Low(0%), 1=Med(33%), 2=High(66%), 3=V.High(100%)
        risk_percentage = (probs[0]*0 + probs[1]*33 + probs[2]*66 + probs[3]*100)
        
        prediction = np.argmax(probs)
        risk_level = RISK_LABELS.get(prediction, 'Unknown')
        
        return jsonify({
            'risk_score': risk_percentage, # Now 0-100
            'risk_level': risk_level,
            'probabilities': {
                'Low': probs[0],
                'Medium': probs[1],
                'High': probs[2],
                'Very High': probs[3]
            },
            'input': {
                'lat': lat,
                'lon': lon,
                'hour': hour
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        # Expects { points: [ {lat, lon, hour}, ... ] }
        data = request.get_json()
        points = data.get('points', [])
        
        if not points:
            return jsonify({'results': []})

        # Convert to DataFrame
        df_batch = pd.DataFrame(points)
        
        # Ensure columns exist and fill defaults
        if 'Hour' not in df_batch.columns and 'hour' in df_batch.columns:
            df_batch.rename(columns={'hour': 'Hour'}, inplace=True)
        if 'Latitude' not in df_batch.columns and 'lat' in df_batch.columns:
            df_batch.rename(columns={'lat': 'Latitude'}, inplace=True)
        if 'Longitude' not in df_batch.columns and 'lon' in df_batch.columns:
            df_batch.rename(columns={'lon': 'Longitude'}, inplace=True)
            
        if 'Hour' not in df_batch.columns:
            df_batch['Hour'] = 20 # Default

        # Predict Probabilities
        all_probs = model.predict_proba(df_batch[['Latitude', 'Longitude', 'Hour']])
        
        results = []
        total_risk_sum = 0
        
        for i, probs in enumerate(all_probs):
            # Weighted Risk for this point
            point_risk = (probs[0]*0 + probs[1]*33 + probs[2]*66 + probs[3]*100)
            pred_class = np.argmax(probs)
            risk_level = RISK_LABELS.get(pred_class, 'Unknown')
            
            results.append({
                'lat': df_batch.iloc[i]['Latitude'],
                'lon': df_batch.iloc[i]['Longitude'],
                'risk_level': risk_level,
                'risk_percentage': point_risk
            })
            total_risk_sum += point_risk

        # Average Path Risk
        avg_risk_percentage = total_risk_sum / len(results) if results else 0
        
        return jsonify({
            'avg_risk_score': avg_risk_percentage, # 0-100
            'points_risk': results
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)
