<template>
    <div>
      <Header />
      <LivroSolo />
      <Footer />
    </div>
  </template>
  
  <script>
  import Header from '@/components/Header.vue';
  import LivroSolo from '@/components/LivroSolo.vue';
  import Footer from '@/components/Footer.vue';
  
  export default {
    components: {
      Header,
      LivroSolo,
      Footer
    },
  };
  </script>