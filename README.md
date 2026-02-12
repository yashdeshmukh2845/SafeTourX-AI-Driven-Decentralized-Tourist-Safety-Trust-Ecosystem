# 🛡️ SafeTourX - AI-Driven Decentralized Tourist Safety Ecosystem

> **A hackathon-ready MVP combining AI Risk Prediction, Real-Time Geo-fencing, and Blockchain Identity.**

---

## 🚀 Project Status & Roadmap

Here is the current completion status of the project tasks:

### ✅ Completed Work (MVP Ready)
- **Backend Infrastructure**
  - [x] Node.js + Express API setup
  - [x] MongoDB integration (with **Zero-Config In-Memory Fallback**)
  - [x] Algorand Blockchain SDK integration
  - [x] JWT Authentication

- **AI Risk Engine**
  - [x] Python + Flask Microservice
  - [x] Random Forest Classifier (~85% Accuracy)
  - [x] Trained on **40K+ Real Indian Crime Records**
  - [x] Real-time Risk Scoring API

- **Frontend Application**
  - [x] React + Tailwind CSS UI
  - [x] User Dashboard & Auth
  - [x] **Live Map View** with Risk Zones (Google Maps)
  - [x] **Hotel Booking System** (Blockchain Verified)
  - [x] **SOS Emergency Alert** (Blockchain Logged)
  - [x] Admin Authority Dashboard

### 🚧 Remaining / Future Work
- [ ] **MainNet Deployment**: Move from Algorand Sandbox/TestNet to MainNet.
- [ ] **Real Geocoding**: Replace simplified city coordinates with dynamic reverse-geocoding.
- [ ] **SMS/Email Alerts**: Integrate Twilio/SendGrid for real-world notifications.
- [ ] **Role-Based Access**: Separate strict admin vs user roles.
- [ ] **Mobile App**: Port React frontend to React Native.

---

## 🛠️ Features

| Feature | Tech Stack | Description |
|---------|------------|-------------|
| **Risk Prediction** | Python, Scikit-Learn | Predicts safety score (0-2) based on location, time, and crime history. |
| **Trust Identity** | Algorand Blockchain | Verifies user identity and actions immutably on-chain. |
| **Live Tracking** | React, Google Maps | Visualizes user location against high-risk zones. |
| **Secure Booking** | Node.js, Blockchain | Logs hotel bookings as tamper-proof transactions. |
| **SOS System** | API, Blockchain | Instant emergency trigger recorded for authority audit. |

---

## ⚙️ Quick Start Guide

### ⚡ The "Zero-Config" Magic
We've implemented an **In-Memory Database** fallback.
**You do NOT need to install MongoDB locally to run the demo!**
*(If MongoDB is missing, the app automatically spins up a temporary database in RAM)*

### 1. Start Backend (Port 5000)
```bash
cd backend
npm start
```
*Output should say: `✅ MongoDB Connected Successfully`*

### 2. Start AI Service (Port 5001)
```bash
cd ai_model
# Windows
.venv\Scripts\activate
python app.py
```

### 3. Start Frontend (Port 3000)
```bash
cd frontend
npm start
```
Access the app at: **http://localhost:3000**

---

## 🧪 Testing the API

You can test the AI Risk Prediction directly:
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"crime_rate":50,"hour":22,"lat":0.5,"lon":0.5}'
```

---

## 📁 Project Structure
```
SafeTourX/
├── backend/       # Node.js API + MongoDB + Algorand
├── frontend/      # React UI + Tailwind CSS
├── ai_model/      # Python Flask + ML Model
└── projects/      # Smart Contracts
```

---

## 📜 License
MIT License. Built for **SafeTourX Team**.
