import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { urlImagem, aoNaoAutorizado } from './api';
import { sessao } from './sessao';
import { avisar } from './avisos';

import './assets/main.css';

// Token recusado pela API (expirou ou o servidor reiniciou): encerra a sessão e
// manda para o login guardando a página em que a pessoa estava.
aoNaoAutorizado(() => {
  if (!sessao.estado.token) return;
  sessao.sair();
  avisar('Sua sessão expirou. Entre de novo para continuar.', 'aviso');
  const atual = router.currentRoute.value;
  if (atual.meta.requiresAuth) {
    router.push({ name: 'entrar', query: { redirect: atual.fullPath } });
  }
});

const app = createApp(App);
app.use(router);

// Disponível em qualquer template como $imagem(caminho, tamanho).
app.config.globalProperties.$imagem = urlImagem;

app.mount('#app');
