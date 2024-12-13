<template>
  <!-- Contêiner principal da lista de livros -->
  <div class="book-list">
    <!-- Título da seção -->
    <h2>Lista de Livros</h2>
    
    <!-- Exibe mensagem de carregamento enquanto os livros são carregados -->
    <div v-if="loading" class="loading">Carregando...</div>
    
    <!-- Exibe mensagem de erro caso haja uma falha na requisição -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- Exibe os livros apenas se houver itens na lista -->
    <div v-if="books.length > 0" class="book-items">
      <!-- Itera sobre cada livro e exibe as informações -->
      <div v-for="book in books" :key="book._id" class="book-item">
        <!-- Exibe a capa do livro se existir -->
        <img v-if="book.coverImage" :src="`http://localhost:5000/${book.coverImage}`" alt="Capa do Livro" class="book-cover" />
        
        <!-- Detalhes do livro, incluindo título, autor, ano, gênero, etc. -->
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
    
    <!-- Exibe mensagem caso não haja livros -->
    <div v-if="books.length === 0" class="no-books">Nenhum livro encontrado.</div>
  </div>
</template>

<script>
import axios from 'axios'; // Importa a biblioteca axios para fazer requisições HTTP

export default {
  data() {
    return {
      books: [], // Lista de livros, inicialmente vazia
      loading: true, // Variável que indica se os livros estão sendo carregados
      errorMessage: null, // Variável para armazenar mensagens de erro
    };
  },
  
  created() {
    this.fetchBooks(); // Chama o método para buscar os livros assim que o componente é criado
  },
  
  methods: {
    // Método assíncrono para buscar os livros da API
    async fetchBooks() {
      try {
        const response = await axios.get('http://localhost:5000/books'); // Faz a requisição GET para a API
        this.books = response.data; // Armazena os livros recebidos na variável books
      } catch (error) {
        this.errorMessage = 'Erro ao carregar os livros. Tente novamente.'; // Exibe mensagem de erro em caso de falha
      } finally {
        this.loading = false; // Atualiza o estado de carregamento para falso, indicando que o carregamento terminou
      }
    },
  },
};
</script>

<style scoped>
/* Estilo para o contêiner da lista de livros */
.book-list {
  max-width: 800px; /* Define a largura máxima do contêiner */
  margin: 0 auto; /* Centraliza o contêiner horizontalmente */
  padding: 20px; /* Adiciona espaçamento interno */
  border-radius: 8px; /* Arredonda as bordas */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Adiciona sombra ao contêiner */
}

/* Estilo para o título da lista de livros */
h2 {
  text-align: center; /* Centraliza o título */
}

/* Estilo para a mensagem de carregamento */
.loading {
  text-align: center; /* Centraliza a mensagem */
  font-size: 18px; /* Define o tamanho da fonte */
  color: #888; /* Define a cor da mensagem */
}

/* Estilo para a mensagem de erro */
.error {
  color: red; /* Define a cor do texto como vermelho */
  text-align: center; /* Centraliza a mensagem */
}

/* Estilo para a lista de itens dos livros, usando grid */
.book-items {
  display: grid; /* Utiliza grid layout */
  grid-template-columns: 1fr 1fr; /* Cria duas colunas iguais */
  gap: 20px; /* Adiciona espaçamento entre os itens */
}

/* Estilo para cada item de livro */
.book-item {
  display: flex; /* Utiliza flexbox para alinhar os itens */
  border: 1px solid #ccc; /* Adiciona borda ao item */
  padding: 15px; /* Adiciona espaçamento interno */
  border-radius: 8px; /* Arredonda as bordas do item */
}

/* Estilo para a imagem da capa do livro */
.book-cover {
  max-width: 100px; /* Define a largura máxima da imagem */
  max-height: 150px; /* Define a altura máxima da imagem */
  margin-right: 20px; /* Adiciona espaçamento à direita da imagem */
  object-fit: cover; /* Faz a imagem cobrir a área sem distorção */
}

/* Estilo para os detalhes do livro */
.book-details {
  flex-grow: 1; /* Faz a seção de detalhes ocupar o espaço restante */
}

/* Estilo para o título do livro */
.book-details h3 {
  font-size: 18px; /* Define o tamanho da fonte */
  margin: 0; /* Remove a margem padrão */
}

/* Estilo para os parágrafos de detalhes do livro */
.book-details p {
  margin: 5px 0; /* Adiciona margem superior e inferior aos parágrafos */
}

/* Estilo para a mensagem quando não há livros encontrados */
.no-books {
  text-align: center; /* Centraliza a mensagem */
  font-size: 18px; /* Define o tamanho da fonte */
  color: #555; /* Define a cor do texto */
}
</style>