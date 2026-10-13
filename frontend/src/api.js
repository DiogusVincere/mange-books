import axios from 'axios';

// Endereço do back-end. Em desenvolvimento cai no localhost; em produção vem de
// VITE_API_URL (frontend/.env). Sem barra no final.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Instância única do axios usada por todos os componentes.
const api = axios.create({ baseURL: API_URL });

// Anexa o token JWT (se houver) em toda requisição.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Monta a URL de uma imagem vinda da API: aceita o caminho relativo gravado pelo
// multer ("uploads/arquivo.jpg", com barra ou contrabarra) ou uma URL completa
// (capas do seed, que apontam para covers.openlibrary.org).
export function urlImagem(caminho) {
  if (!caminho) return '';
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${API_URL}/${String(caminho).replace(/\\/g, '/').replace(/^\/+/, '')}`;
}

export default api;
