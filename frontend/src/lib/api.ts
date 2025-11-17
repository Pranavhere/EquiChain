import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Market API
export const marketAPI = {
  getPrice: () => api.get('/market/price'),
  
  buy: (amountInRupees: number) =>
    api.post('/market/buy', { amountInRupees }),
  
  sell: (tokenAmount: string) =>
    api.post('/market/sell', { tokenAmount }),
  
  calculateTokens: (amountInRupees: number) =>
    api.post('/market/calculate-tokens', { amountInRupees }),
};

// Portfolio API
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  
  getBalance: () => api.get('/portfolio/balance'),
};

export default api;
