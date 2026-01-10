import api from './api';

export const loginRequest = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; 
};

export const registerRequest = async (credentials) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};