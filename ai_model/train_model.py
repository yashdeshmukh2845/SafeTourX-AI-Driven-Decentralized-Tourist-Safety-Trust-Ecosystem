import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# 1. Generate Dummy Data
# Features: 
# - crime_rate: 0 (Safe) to 100 (Dangerous)
# - hour: 0 to 23
# - lat, lon: Normalized coordinates for simplicity (0 to 1)

np.random.seed(42)
n_samples = 1000

crime_rate = np.random.randint(0, 101, n_samples)
hour = np.random.randint(0, 24, n_samples)
lat = np.random.uniform(0, 1, n_samples)
lon = np.random.uniform(0, 1, n_samples)

# Target: Risk Score (0: Low, 1: Medium, 2: High)
# Logic: 
# - High crime_rate (> 70) -> High Risk
# - Late night (22-04) + Med crime_rate (> 40) -> High Risk
# - Low crime_rate (< 30) -> Low Risk
# - Else -> Medium Risk

risk_score = []
for i in range(n_samples):
    c = crime_rate[i]
    h = hour[i]
    
    if c > 70:
        risk_score.append(2) # High
    elif (h >= 22 or h <= 4) and c > 40:
        risk_score.append(2) # High
    elif c < 30:
        risk_score.append(0) # Low
    else:
        risk_score.append(1) # Medium

df = pd.DataFrame({
    'crime_rate': crime_rate,
    'hour': hour,
    'lat': lat,
    'lon': lon,
    'risk_score': risk_score
})

print("Dataset Head:")
print(df.head())

# 2. Train Model
X = df[['crime_rate', 'hour', 'lat', 'lon']]
y = df['risk_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 3. Evaluate
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# 4. Save Model
joblib.dump(model, 'risk_model.pkl')
print("Model saved to risk_model.pkl")
