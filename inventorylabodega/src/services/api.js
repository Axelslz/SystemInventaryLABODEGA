import axios from 'axios';

// const URL_BACKEND = 'https://systeminventorylabodegaback.onrender.com/api'; 

// const api = axios.create({
//   baseURL: URL_BACKEND, 
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
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