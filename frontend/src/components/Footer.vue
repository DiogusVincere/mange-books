<template>
  <footer>
    <div class="footer-content">
      <div class="footer-logo">
        <img :src="logoSrc" alt="Logo Biblioteca Mange Book">
      </div>
      <p>Copyright 2024 - Biblioteca Mange Book - Todos direitos reservados.</p>
      <p>{{ address }}</p>
    </div>
  </footer>
</template>

<script>
import logoImage from '@/assets/img/logosenai.png';

export default {
  data() {
    return {
      logoSrc: logoImage,
      address: 'Rua Pastor Cicero Canuto de Lima, 71º, São Bernardo - Vila Rialto, Campinas - SP, 13036-210',
    };
  },
};
</script>


<style scoped>
/* Estilos globais */
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
}

a {
  text-decoration: none;
  color: white;
}

footer {
  background-color: #FF1A0A;
  color: white;
  text-align: center;
  padding: 20px 10px;
}

.footer-logo img {
  height: 50px;
  margin-bottom: 10px;
}

footer p {
  margin: 5px 0;
}
</style>
