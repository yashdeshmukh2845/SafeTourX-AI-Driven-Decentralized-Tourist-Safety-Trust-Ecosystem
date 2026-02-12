from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load Model
try:
    model = joblib.load('risk_model.pkl')
    print("Model loaded successfully.")
except:
    print("Model not found. Please run train_model.py first.")
    model = None

@app.route('/', methods=['GET'])
def index():
    return "SafeTourX AI Risk Module Running..."

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()
        
        # Expected input: { crime_rate (0-100), hour (0-23), lat, lon }
        crime_rate = data.get('crime_rate', 50)
        hour = data.get('hour', 12)
        lat = data.get('lat', 0.5)
        lon = data.get('lon', 0.5)

        features = pd.DataFrame([[crime_rate, hour, lat, lon]], columns=['crime_rate', 'hour', 'lat', 'lon'])
        
        prediction = model.predict(features)[0]
        
        risk_labels = {0: 'Low', 1: 'Medium', 2: 'High'}
        risk_level = risk_labels.get(prediction, 'Unknown')

        return jsonify({
            'risk_score': int(prediction),
            'risk_level': risk_level,
            'input': {
                'crime_rate': crime_rate,
                'hour': hour
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)
