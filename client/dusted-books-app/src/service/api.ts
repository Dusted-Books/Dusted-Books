import axios from 'axios';

// Create axios instance with optimized configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000, // 15 second timeout
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
    (config) => {
        // Add any auth tokens here if needed
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 401) {
                // Unauthorized - clear auth and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Forbidden:', data.message);
            } else if (status >= 500) {
                console.error('Server error:', data.message);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error: No response from server');
        }

        return Promise.reject(error);
    }
);

export default api;
