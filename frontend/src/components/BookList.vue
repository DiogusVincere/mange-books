<template>
    <div class="book-list">
      <h2>Lista de Livros</h2>
      <div v-if="loading" class="loading">Carregando...</div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  
      <div v-if="books.length > 0" class="book-items">
        <div v-for="book in books" :key="book._id" class="book-item">
          <img v-if="book.coverImage" :src="`http://localhost:5000/${book.coverImage}`" alt="Capa do Livro" class="book-cover" />
          <div class="book-details">
            <h3>{{ book.title }}</h3>
            <p><strong>Autor:</strong> {{ book.author }}</p>
            <p><strong>Ano:</strong> {{ book.year }}</p>
            <p><strong>Gênero:</strong> {{ book.genre }}</p>
            <p><strong>ISBN:</strong> {{ book.isbn }}</p>
            <p><strong>Páginas:</strong> {{ book.pageCount }}</p>
            <p><strong>Tipo de Capa:</strong> {{ book.coverType }}</p>
          </div>
        </div>
      </div>
      <div v-if="books.length === 0" class="no-books">Nenhum livro encontrado.</div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        books: [], // Lista de livros
        loading: true, // Estado para indicar se está carregando
        errorMessage: null, // Mensagem de erro caso a requisição falhe
      };
    },
    created() {
      this.fetchBooks(); // Chama o método para buscar os livros ao carregar o componente
    },
    methods: {
      async fetchBooks() {
        try {
          const response = await axios.get('http://localhost:5000/books');
          this.books = response.data; // Armazena os livros retornados da API
        } catch (error) {
          this.errorMessage = 'Erro ao carregar os livros. Tente novamente.';
        } finally {
          this.loading = false; // Atualiza o estado de carregamento
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .book-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
  }
  
  .loading {
    text-align: center;
    font-size: 18px;
    color: #888;
  }
  
  .error {
    color: red;
    text-align: center;
  }
  
  .book-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .book-item {
    display: flex;
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 8px;
  }
  
  .book-cover {
    max-width: 100px;
    max-height: 150px;
    margin-right: 20px;
    object-fit: cover;
  }
  
  .book-details {
    flex-grow: 1;
  }
  
  .book-details h3 {
    font-size: 18px;
    margin: 0;
  }
  
  .book-details p {
    margin: 5px 0;
  }
  
  .no-books {
    text-align: center;
    font-size: 18px;
    color: #555;
  }
  </style>
  