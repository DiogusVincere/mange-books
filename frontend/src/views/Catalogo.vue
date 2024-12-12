<template>
    <div>
      <Header />
      <CatalogoLivros />
      <Footer />
    </div>
  </template>
  
  <script>
  import Header from '@/components/Header.vue';
  import CatalogoLivros from '@/components/CatalogoLivros.vue';
  import Footer from '@/components/Footer.vue';
  
  export default {
    components: {
      Header,
      CatalogoLivros,
      Footer
    },
  };
  </script>