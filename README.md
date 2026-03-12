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
  - [x] **Algorand TestNet Integration**

### 🚧 Remaining / Future Work
- [ ] **MainNet Deployment**: Move from Algorand Sandbox/TestNet to MainNet.
- [ ] **Real Geocoding**: Replace simplified city coordinates with dynamic reverse-geocoding.
- [ ] **SMS/Email Alerts**: Integrate Twilio/SendGrid for real-world notifications.
- [ ] **Role-Based Access**: Separate strict admin vs user roles.

### 🚀 Implemented Enhancements (Hackathon Ready)
- **Shadow Mode**: 
  - Real-time safety monitoring toggled from Dashboard.
  - Automatic SOS triggering if risk level stays high without user response.
  - Emergency contact integration.
- **Proof-of-Stay Reviews**:
  - Verified booking reviews stored on-chain.
  - "Verified Stay" badge for authentic feedback.
- **Smart Escrow Simulation**:
  - Booking lifecycle management (Pending -> Confirmed -> Completed/Refunded).
  - Simulated funds holding and blockchain-logged refunds.

---

## 🌐 Algorand TestNet Deployment

SafeTourX smart contracts are fully deployed and publicly verifiable on the Algorand TestNet.

| Component | Details |
|-----------|---------|
| **Network** | **Algorand TestNet** |
| **Node Provider** | AlgoNode Public API |
| **Smart Contract** | PyTeal → TEAL |
| **Deploy Script** | `projects/contracts/deploy_manual.py` |
| **Application ID** | **`755433170`** |
| **Deployment Wallet** | `BRZAIDE7N3PSAJMRDV7PYV5UBKMUR4QUPRL6LA3KCVU7ZOADP7CRYK44CA` |
| **Deployment TXID** | **`V4YRGP233BK56E4U3WVYWF6YC4Y2MMADE5S2IV46V6HBINICBSTA`** |

🔗 **[View Deployment on AlgoExplorer](https://testnet.algoexplorer.io/tx/V4YRGP233BK56E4U3WVYWF6YC4Y2MMADE5S2IV46V6HBINICBSTA)**

---

## 🪙 Funding TestNet Wallet

To interact with the application or deploy contracts, you need TestNet Algos.

1.  **Copy your wallet address**.
2.  Visit the [Algorand TestNet Dispenser](https://lora.algokit.io/testnet/fund).
3.  Request **5–10 ALGO**.
4.  Verify balance on [AlgoExplorer](https://testnet.algoexplorer.io/).

---

## 🚀 Deployment Commands

To re-deploy the SafeTourX smart contracts or start the full stack:

### 1. Deploy Contract
```bash
cd projects/contracts
python deploy_manual.py
```
*Script outputs the new App ID and Transaction URL.*

### 2. Start Backend (Port 5000)
```bash
cd backend
npm start
```

### 3. Start AI Service (Port 5001)
```bash
cd ai_model
# Windows
.venv\Scripts\activate
python app.py
```

### 4. Start Frontend (Port 3000)
```bash
cd frontend
npm start
```
Access the app at: **http://localhost:3000**

---

## 🔍 Verifying On-Chain Transactions

The following actions are transparently logged on Algorand TestNet:

- **User Registration**: Identity hash stored.
- **Hotel Booking**: Booking details secured.
- **SOS Trigger**: Emergency event logged.

**To Verify:**
1. Perform an action in the app (e.g., Register).
2. Copy the **TX ID** from the success notification.
3. Visit [AlgoExplorer TestNet](https://testnet.algoexplorer.io/).
4. Paste the TX ID to see the immutable record.

---

## ✅ Deployment Summary

- **Smart Contract**: Deployed on TestNet
- **Identity Logging**: On-Chain ✅
- **Booking Logging**: On-Chain ✅
- **SOS Logging**: On-Chain ✅
- **Verification**: Public Explorer Links ✅
- **Status**: **Hackathon-Ready MVP** 🏆

---

## ⚙️ Quick Start Guide

### ⚡ The "Zero-Config" Magic
We've implemented an **In-Memory Database** fallback.
**You do NOT need to install MongoDB locally to run the demo!**

---

## 📜 License
MIT License. Built with ❤️ by **SafeTourX Team**.
