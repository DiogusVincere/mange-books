// Estado da sessão (token + usuário logado), compartilhado por toda a aplicação.
import { reactive, computed } from 'vue';
import api from './api';

const estado = reactive({
  token: localStorage.getItem('token') || '',
  usuario: null,
  carregando: false,
});

let carregamento = null;

export const sessao = {
  estado,
  logado: computed(() => Boolean(estado.token)),
  bibliotecario: computed(() => Boolean(estado.usuario && estado.usuario.role === 'bibliotecario')),

  // Busca o perfil (uma vez) quando há token. Chamadas simultâneas compartilham a mesma promessa.
  carregar(forcar = false) {
    if (!estado.token) {
      estado.usuario = null;
      return Promise.resolve(null);
    }
    if (estado.usuario && !forcar) return Promise.resolve(estado.usuario);
    if (carregamento && !forcar) return carregamento;
    estado.carregando = true;
    carregamento = api
      .get('/api/auth/me')
      .then(({ data }) => {
        estado.usuario = data;
        return data;
      })
      .catch(() => null)
      .finally(() => {
        estado.carregando = false;
        carregamento = null;
      });
    return carregamento;
  },

  entrar(token, usuario) {
    localStorage.setItem('token', token);
    estado.token = token;
    estado.usuario = usuario || null;
    return sessao.carregar(true);
  },

  sair() {
    localStorage.removeItem('token');
    estado.token = '';
    estado.usuario = null;
  },

  atualizarUsuario(dados) {
    estado.usuario = { ...(estado.usuario || {}), ...dados };
  },
};
