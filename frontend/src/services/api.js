import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AI_BASE_URL = process.env.REACT_APP_AI_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Identity APIs
export const registerUser = async (userData) => {
    const response = await api.post('/identity/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post('/identity/login', credentials);
    return response.data;
};

// Booking APIs
export const createBooking = async (bookingData) => {
    const response = await api.post('/booking/create', bookingData);
    return response.data;
};

export const getUserBookings = async (userId) => {
    const response = await api.get(`/booking/${userId}`);
    return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
    const response = await api.put(`/booking/${bookingId}/status`, { status });
    return response.data;
};

// SOS APIs
export const triggerSOS = async (sosData) => {
    const response = await api.post('/sos/trigger', sosData);
    return response.data;
};

export const getAllIncidents = async () => {
    const response = await api.get('/sos');
    return response.data;
};

// Risk Prediction API
export const getRiskPrediction = async (location) => {
    // Falls back to /api/risk/ via proxy if mounted at /api/risk and route is /
    // If backend route is /risk/risk, we might access /risk/risk
    // Safest is to try root
    try {
        const response = await api.post('/risk', location);
        return response.data;
    } catch {
        // Fallback for older route structure
        const response = await api.post('/risk/risk', location);
        return response.data;
    }
};

// Route Risk Analysis
export const getRouteRisk = async (points) => {
    const response = await api.post('/risk/batch', { points });
    return response.data;
};

// Reviews
export const submitReview = async (reviewData) => {
    const response = await api.post('/reviews/add', reviewData);
    return response.data;
};

export default api;
