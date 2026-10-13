import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { urlImagem } from './api';

import './assets/fonts.css';

const app = createApp(App);

app.use(router);

// Disponível em qualquer template como $imagem(caminho).
app.config.globalProperties.$imagem = urlImagem;

app.mount('#app');
