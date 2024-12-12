<template>
    <div class="not-found">
      <div class="not-found-container">
        <h1 class="not-found-title">404</h1>
        <p class="not-found-message">Página não encontrada</p>
        <p class="not-found-description">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <router-link to="/" class="go-home-btn">Voltar para a Página Inicial</router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFound',
  };
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f4f4;
    color: #333;
    font-family: Arial, sans-serif;
  }
  
  .not-found-container {
    text-align: center;
    padding: 30px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  }
  
  .not-found-title {
    font-size: 120px;
    font-weight: bold;
    margin: 0;
    color: #ff1a0a;
  }
  
  .not-found-message {
    font-size: 24px;
    margin-top: 10px;
  }
  
  .not-found-description {
    font-size: 16px;
    margin-top: 10px;
    color: #555;
  }
  
  .go-home-btn {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #ff1a0a;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .go-home-btn:hover {
    background-color: #e00000;
  }
  </style>
  