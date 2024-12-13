<template>
  <!-- Definindo o template da aplicação -->
  <div id="app">
    <!-- O componente RouterView renderiza o componente correspondente à rota atual -->
    <RouterView />
  </div>
</template>

<script>
// Importando os componentes e views necessários para o funcionamento do app
import Home from './views/Homes.vue'; // Importa a view Home
import Header from './components/Header.vue'; // Importa o componente Header
import BookForm from './components/BookForm.vue'; // Importa o componente BookForm para adicionar livros
import BookList from './components/BookList.vue'; // Importa o componente BookList para exibir a lista de livros
import Footer from './components/Footer.vue'; // Importa o componente Footer
import Catalogo from './views/Catalogo.vue'; // Importa a view Catalogo
import RegistrarUsuario from './components/RegistrarUsuario.vue'; // Importa o componente RegistrarUsuario
import Login from './components/Login.vue'; // Importa o componente Login

// Definindo o componente principal 'App'
export default {
  name: 'App', // Nome do componente
  components: {
    // Declaração de todos os componentes utilizados no template
    Home, // Componente Home
    BookForm, // Componente BookForm
    BookList, // Componente BookList
    Header, // Componente Header
    Footer, // Componente Footer
    Catalogo, // Componente Catalogo
    RegistrarUsuario, // Componente RegistrarUsuario
    Login // Componente Login
  }
};
</script>

<style scoped>
  /* Estilo do componente é escopo específico a ele, mas aqui não há estilos definidos */
</style>
