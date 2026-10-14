import axios from 'axios';

// Endereço do back-end. Em desenvolvimento cai no localhost; em produção vem de
// VITE_API_URL (frontend/.env). Sem barra no final.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Instância única do axios usada por todos os componentes. O tempo limite é alto
// porque o servidor gratuito da demonstração dorme e leva alguns segundos para acordar.
const api = axios.create({ baseURL: API_URL, timeout: 60000 });

// Anexa o token JWT (se houver) em toda requisição.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Quem cuida do 401 é registrado por main.js (evita import circular com o router).
let tratarNaoAutorizado = null;
export function aoNaoAutorizado(fn) {
  tratarNaoAutorizado = fn;
}
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const status = erro.response && erro.response.status;
    const rota = (erro.config && erro.config.url) || '';
    if (status === 401 && tratarNaoAutorizado && !rota.includes('/api/auth/login')) {
      tratarNaoAutorizado(erro);
    }
    return Promise.reject(erro);
  },
);

// Monta a URL de uma imagem vinda da API: aceita o caminho relativo gravado pelo
// multer ("uploads/arquivo.jpg", com barra ou contrabarra) ou uma URL completa.
// Para capas da Open Library, `tamanho` ('S', 'M' ou 'L') troca a resolução.
export function urlImagem(caminho, tamanho) {
  if (!caminho) return '';
  let url = /^https?:\/\//i.test(caminho)
    ? caminho
    : `${API_URL}/${String(caminho).replace(/\\/g, '/').replace(/^\/+/, '')}`;
  if (tamanho && /covers\.openlibrary\.org\/b\/isbn\/[\dXx]+-[SML]\.jpg/i.test(url)) {
    url = url.replace(/-[SML]\.jpg/i, `-${tamanho}.jpg`);
  }
  return url;
}

// Mensagem legível para um erro do axios.
export function mensagemDeErro(erro, padrao = 'Algo deu errado. Tente de novo.') {
  if (erro && erro.response && erro.response.data && erro.response.data.message) {
    return erro.response.data.message;
  }
  if (erro && (erro.code === 'ERR_NETWORK' || erro.code === 'ECONNABORTED')) {
    return 'Não foi possível falar com o servidor. Ele pode estar acordando; tente de novo em alguns segundos.';
  }
  return padrao;
}

// Erros por campo devolvidos pela API ({ campo: mensagem }).
export function errosDeCampo(erro) {
  return (erro && erro.response && erro.response.data && erro.response.data.erros) || {};
}

export default api;
