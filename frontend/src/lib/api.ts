import axios from 'axios';

// In Railway, frontend and backend are at different URLs on the same network
// Frontend is served by nginx, backend is a separate service
// We need to use the backend's public URL
let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // Auto-detect backend URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // Local development
      API_URL = 'http://localhost:8000';
    } else {
      // Railway production - use the backend service name or URL
      // Try to match the pattern from frontend hostname
      if (hostname.includes('equichain-frontend')) {
        // Replace 'frontend' with 'backend' in the hostname
        API_URL = `${protocol}//${hostname.replace('equichain-frontend', 'equichain-backend')}`;
      } else if (hostname.includes('railway.app')) {
        // Generic Railway domain - try common backend URL patterns
        API_URL = `${protocol}//equichain-backend-production.up.railway.app`;
      } else {
        // Fallback
        API_URL = `${protocol}//equichain-backend-production.up.railway.app`;
      }
    }
    
    console.log('🔍 Auto-detecting API URL:');
    console.log('   Hostname:', hostname);
    console.log('   Protocol:', protocol);
    console.log('   Detected URL:', API_URL);
  } else {
    API_URL = 'http://localhost:8000';
  }
}

console.log('📡 Final API URL:', API_URL);

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
  console.log('📤 Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Request failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    });
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
