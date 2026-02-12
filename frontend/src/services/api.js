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
    const response = await api.post('/risk', location);
    return response.data;
};

export default api;
