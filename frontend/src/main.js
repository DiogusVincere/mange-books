import { createApp } from 'vue';  // Importe o Vue 3
import App from './App.vue';
import router from './router';  // Importe o router

// Importe fontes no arquivo CSS global
import './assets/fonts.css'; // Crie este arquivo para importar as fontes

const app = createApp(App);

app.use(router);  // Adicione o Vue Router ao Vue

app.mount('#app');  // Monte o aplicativo
