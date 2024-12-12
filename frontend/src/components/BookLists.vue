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
import axios from "axios";

export default {
  data() {
    return {
      books: [], // Lista completa de livros retornada pela API
      loading: true, // Estado de carregamento
      errorMessage: null, // Mensagem de erro caso algo dê errado
      currentIndex: 0, // Índice inicial do carrossel
      itemsPerPage: 4, // Número de itens visíveis por vez (PC padrão)
    };
  },
  computed: {
    limitedBooks() {
      return this.books.slice(-8); // Obtém os últimos 8 livros
    },
    visibleBooks() {
      return this.limitedBooks.slice(
        this.currentIndex,
        this.currentIndex + this.itemsPerPage
      );
    },
  },
  created() {
    this.fetchBooks(); // Busca os livros ao carregar o componente
  },
  methods: {
    async fetchBooks() {
      try {
        const response = await axios.get("http://localhost:5000/books");
        this.books = response.data;
      } catch (error) {
        this.errorMessage = "Erro ao carregar os livros. Tente novamente.";
      } finally {
        this.loading = false;
      }
    },
    moveToNext() {
      if (this.currentIndex + this.itemsPerPage < this.limitedBooks.length) {
        this.currentIndex++;
      }
    },
    moveToPrevious() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
  },
};
</script>

<style scoped>
.book-form {
  width: 300px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

h2 {
  text-align: center;
}

form div {
  margin-bottom: 10px;
}

input {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>