++import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Load Data
print("Loading dataset...")
df = pd.read_csv('maharashtra_crime_dummy_50000.csv')

# Preprocessing
print("Preprocessing...")
# Extract Hour from Time (HH:MM)
df['Hour'] = pd.to_datetime(df['Time'], format='%H:%M').dt.hour

# Encode Target
le = LabelEncoder()
# Mapping order preference: Low=0, Medium=1, High=2, Very High=3
# LabelEncoder sorts alphabetically: High, Low, Medium, Very High. This is bad for regression-like ordinality but okay for classification if we map back correctly.
# Let's map manually to ensure risk order.
risk_mapping = {'Low': 0, 'Medium': 1, 'High': 2, 'Very High': 3}
df['Risk_Class'] = df['Risk_Level'].map(risk_mapping)

# Features: Lat, Lon, Hour
X = df[['Latitude', 'Longitude', 'Hour']]
y = df['Risk_Class']

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Model
print("Training Random Forest...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy: {accuracy:.2f}")

# Save Model
print("Saving model...")
joblib.dump(model, 'risk_model.pkl')
print("✅ Risk Model Saved!")
