import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
from datetime import datetime

# Load Indian Crime Dataset
print("Loading Indian Crime Dataset...")
df = pd.read_csv('crime_dataset_india.csv')

print(f"Dataset loaded: {len(df)} records")
print(f"Columns: {df.columns.tolist()}")
print("\nDataset Head:")
print(df.head())

# Data Cleaning
print("\n=== Data Cleaning ===")
# Drop rows with missing critical values
df = df.dropna(subset=['City', 'Time of Occurrence'])

# Extract features
print("\n=== Feature Engineering ===")

# Extract hour from 'Time of Occurrence'
def extract_hour(time_str):
    try:
        # Format: "DD-MM-YYYY HH:MM"
        time_part = time_str.split(' ')[-1]  # Get HH:MM
        hour = int(time_part.split(':')[0])
        return hour
    except:
        return 12  # Default to noon if parsing fails

df['hour'] = df['Time of Occurrence'].apply(extract_hour)

# Crime count per city (as proxy for crime rate)
city_crime_counts = df['City'].value_counts().to_dict()
df['crime_rate'] = df['City'].map(city_crime_counts)

# Normalize crime rate to 0-100 scale
max_crime = df['crime_rate'].max()
df['crime_rate'] = (df['crime_rate'] / max_crime) * 100

# Assign dummy lat/lon based on city (simplified for MVP)
# In production, you'd use actual geocoding
city_coords = {
    'Mumbai': (19.0760, 72.8777),
    'Delhi': (28.6139, 77.2090),
    'Bangalore': (12.9716, 77.5946),
    'Hyderabad': (17.3850, 78.4867),
    'Ahmedabad': (23.0225, 72.5714),
    'Chennai': (13.0827, 80.2707),
    'Kolkata': (22.5726, 88.3639),
    'Pune': (18.5204, 73.8567),
    'Jaipur': (26.9124, 75.7873),
    'Surat': (21.1702, 72.8311),
    'Lucknow': (26.8467, 80.9462),
    'Kanpur': (26.4499, 80.3319),
    'Nagpur': (21.1458, 79.0882),
    'Indore': (22.7196, 75.8577),
    'Thane': (19.2183, 72.9781),
    'Bhopal': (23.2599, 77.4126),
    'Visakhapatnam': (17.6868, 83.2185),
    'Patna': (25.5941, 85.1376),
    'Vadodara': (22.3072, 73.1812),
    'Ghaziabad': (28.6692, 77.4538),
    'Ludhiana': (30.9010, 75.8573),
    'Agra': (27.1767, 78.0081),
    'Nashik': (19.9975, 73.7898),
    'Faridabad': (28.4089, 77.3178),
    'Meerut': (28.9845, 77.7064),
    'Rajkot': (22.3039, 70.8022),
    'Kalyan': (19.2403, 73.1305),
    'Vasai': (19.4612, 72.7985),
    'Varanasi': (25.3176, 82.9739),
    'Srinagar': (34.0837, 74.7973),
}

# Default coordinates for cities not in the list
default_coords = (20.5937, 78.9629)  # Center of India

df['lat'] = df['City'].apply(lambda x: city_coords.get(x, default_coords)[0])
df['lon'] = df['City'].apply(lambda x: city_coords.get(x, default_coords)[1])

# Normalize lat/lon to 0-1 range
df['lat'] = (df['lat'] - df['lat'].min()) / (df['lat'].max() - df['lat'].min())
df['lon'] = (df['lon'] - df['lon'].min()) / (df['lon'].max() - df['lon'].min())

# Create risk categories based on crime density
print("\n=== Creating Risk Categories ===")

# Define risk based on crime rate thresholds
def assign_risk(crime_rate):
    if crime_rate < 33:
        return 0  # Low
    elif crime_rate < 66:
        return 1  # Medium
    else:
        return 2  # High

df['risk_score'] = df['crime_rate'].apply(assign_risk)

# Check distribution
print("\nRisk Distribution:")
print(df['risk_score'].value_counts().sort_index())

# Prepare features and target
X = df[['crime_rate', 'hour', 'lat', 'lon']].values
y = df['risk_score'].values

print(f"\nFeature Matrix Shape: {X.shape}")
print(f"Target Vector Shape: {y.shape}")

# Split dataset
print("\n=== Splitting Dataset ===")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training Set: {X_train.shape[0]} samples")
print(f"Test Set: {X_test.shape[0]} samples")

# Train Random Forest Classifier
print("\n=== Training Random Forest Classifier ===")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
print("Model training complete!")

# Evaluate Model
print("\n=== Model Evaluation ===")
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {accuracy:.4f}")

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High']))

# Feature Importance
print("\nFeature Importance:")
feature_names = ['crime_rate', 'hour', 'lat', 'lon']
importances = model.feature_importances_
for name, importance in zip(feature_names, importances):
    print(f"  {name}: {importance:.4f}")

# Save the trained model
print("\n=== Saving Model ===")
joblib.dump(model, 'risk_model.pkl')
print("Model saved to risk_model.pkl")

print("\n=== Training Complete ===")
