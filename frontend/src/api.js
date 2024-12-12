import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});

// Adicionando interceptor para incluir o token nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Pega o token armazenado no localStorage
  console.log('Token enviado:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
