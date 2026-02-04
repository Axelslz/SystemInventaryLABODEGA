import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const URL_BACKEND = isLocal 
  ? 'http://localhost:5000/api' 
  : 'https://systeminventorylabodegaback.onrender.com/api';

console.log("Conectando a:", URL_BACKEND); 

const api = axios.create({
  baseURL: URL_BACKEND, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
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

export default api;