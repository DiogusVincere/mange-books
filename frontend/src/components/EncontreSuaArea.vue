<template>
    <section class="encontre-sua-area">
      <h2>Encontre sua área</h2>
      <div class="generos-livros">
        <div class="linha-generos" v-for="(linha, index) in generos" :key="index">
          <button v-for="(genero, idx) in linha" :key="idx">{{ genero }}</button>
        </div>
        <hr class="separador" />
      </div>
    </section>
  </template>
  
  <script>
  export default {
    data() {
      return {
        generos: [
          ['Fantasia', 'Terror', 'Drama'],
          ['Suspense', 'Ação', 'Ficção'],
        ],
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

  .linha-generos {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
  }
  
  .linha-generos button {
    padding: 10px 20px;
    background-color: #1f2f4f;
    color: white;
    border: none;
    cursor: pointer;
  }
  </style>
  