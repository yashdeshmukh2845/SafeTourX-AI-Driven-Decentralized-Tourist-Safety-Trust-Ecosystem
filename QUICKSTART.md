# SafeTourX - Quick Start Guide

## ✅ Currently Running Services

1. **AI Service** - ✅ Running on `http://localhost:5001`
2. **Frontend** - ✅ Running on `http://localhost:3000`
3. **Backend** - ⚠️ Waiting for MongoDB connection

## 🚀 How to Run the Complete Application

### Option 1: Without MongoDB (Frontend + AI Only)

**What Works:**
- Frontend UI (all pages)
- AI risk predictions
- Map view (requires Google Maps API key)

**What Doesn't Work:**
- User registration/login
- Booking creation
- SOS alerts
- Data persistence

**To Access:**
1. Open browser: `http://localhost:3000`
2. You'll see login page (won't work without backend)

---

### Option 2: With MongoDB (Full Stack)

#### Step 1: Install MongoDB
If you don't have MongoDB installed:
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **Or use MongoDB Atlas** (cloud): https://www.mongodb.com/cloud/atlas

#### Step 2: Start MongoDB
```bash
# If installed locally
mongod

# Or update backend/.env to use MongoDB Atlas connection string
```

#### Step 3: Start Backend
```bash
cd backend
npm start
```

Backend will run on `http://localhost:5000`

#### Step 4: Access Application
Open browser: `http://localhost:3000`

---

## 🎯 Quick Demo (Without Backend)

You can still explore the frontend UI:

1. **Visit**: `http://localhost:3000`
2. **Pages Available**:
   - `/register` - Registration form
   - `/login` - Login form
   - `/dashboard` - Main dashboard (requires login)
   - `/map` - Map view with geo-fencing
   - `/booking` - Hotel booking form
   - `/sos` - Emergency SOS button
   - `/admin` - Authority dashboard

**Note**: Without backend, you can only view the UI design, not the functionality.

---

## 📝 Environment Setup

### Frontend `.env`
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_URL=http://localhost:5001
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

### Backend `.env`
Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/safetourx
PORT=5000
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
MNEMONIC=your mnemonic here
APP_ID=
```

---

## 🔧 Troubleshooting

### MongoDB Not Installed
**Error**: `mongod: command not found`
**Solution**: Install MongoDB or use MongoDB Atlas (cloud)

### Backend Can't Connect to MongoDB
**Error**: `MongooseError: connect ECONNREFUSED`
**Solution**: 
1. Make sure MongoDB is running (`mongod`)
2. Or update `MONGO_URI` in `backend/.env` to use cloud MongoDB

### Google Maps Not Loading
**Error**: Map shows blank or error
**Solution**: Add your Google Maps API key to `frontend/.env`

---

## 📊 Service Status

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Frontend | 3000 | ✅ Running | http://localhost:3000 |
| Backend | 5000 | ⚠️ Needs MongoDB | http://localhost:5000 |
| AI Service | 5001 | ✅ Running | http://localhost:5001 |
| MongoDB | 27017 | ❌ Not Running | - |

---

## 🎓 For Full Demo

To demonstrate all features (registration, booking, SOS, blockchain):
1. Install and start MongoDB
2. Start backend
3. Frontend and AI are already running
4. Visit `http://localhost:3000`
5. Register a new user
6. Explore all features!

---

**Current Status**: Frontend and AI Service are ready! Just need MongoDB for full functionality.
