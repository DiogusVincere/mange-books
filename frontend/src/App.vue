<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script>
import Home from './views/Homes.vue';
import Header from './components/Header.vue';
import BookForm from './components/BookForm.vue';
import BookList from './components/BookList.vue';
import Footer from './components/Footer.vue';
import Catalogo from './views/Catalogo.vue';
import RegistrarUsuario from './components/RegistrarUsuario.vue';
import Login from './components/Login.vue';

export default {
  name: 'App',
  components: {
    Home,
    BookForm,
    BookList,
    Header,
    Footer,
    Catalogo,
    RegistrarUsuario,
    Login
  }
};
</script>

<style scoped>

</style>
