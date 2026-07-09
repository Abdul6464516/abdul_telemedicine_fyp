import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://abdul-telemedicine-fyp-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage to every request if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.log("error", err);
  }
  return config;
});

export default api;
