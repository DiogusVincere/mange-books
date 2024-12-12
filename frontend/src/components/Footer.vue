<template>
    <footer>
      <!-- Conteúdo do rodapé -->
      <div class="footer-content">
        <!-- Logo no rodapé -->
        <div class="footer-logo">
          <img :src="logoSrc" alt="Logo Biblioteca Mange Book">
        </div>
        <!-- Texto de direitos autorais -->
        <p>Copyright 2024 - Biblioteca Mange Book - Todos direitos reservados.</p>
        <!-- Endereço da biblioteca -->
        <p>{{ address }}</p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    data() {
      return {
        logoSrc: '../assets/img/logosenai.png', // Caminho para a logo
        address: 'Rua Pastor Cicero Canuto de Lima, 71º, São Bernardo - Vila Rialto, Campinas - SP, 13036-210', // Endereço da biblioteca
      };
    },
  };
  </script>
  
  <style scoped>

/* Estilos globais para todo o site */
body {
    /* Define a fonte do texto para todo o site */
    font-family: 'Roboto', sans-serif;
    /* Remove as margens padrão do body */
    margin: 0;
    /* Remove o padding padrão do body */
    padding: 0;
    /* Cor de fundo clara para o site */
    background-color: #f0f0f0;
}

/* Estilos para links */
a {
    /* Remove o sublinhado dos links */
    text-decoration: none;
    /* Define a cor do texto dos links como branco */
    color: white;
}

  /* Estilos para o rodapé */
  footer {
    /* Cor de fundo do rodapé */
    background-color: #FF1A0A;
    /* Cor do texto em branco */
    color: white;
    /* Centraliza o texto e o conteúdo */
    text-align: center;
    /* Padding interno no rodapé */
    padding: 20px 10px;
  }
  
  /* Estilo para a logo no rodapé */
  footer .footer-logo img {
    /* Altura da logo no rodapé */
    height: 50px;
    /* Margem inferior da logo */
    margin-bottom: 10px;
  }
  
  /* Estilos para os parágrafos do rodapé */
  footer p {
    /* Margem entre os parágrafos */
    margin: 5px 0;
  }
  </style>
  