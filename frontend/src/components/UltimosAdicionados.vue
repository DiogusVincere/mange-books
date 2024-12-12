<template>
  <section class="ultimos-adicionados">
    <div class="titulo-carrossel">
      <h2>Últimos adicionados</h2>
      <a href="#" class="ver-todos">Ver todos</a>
    </div>
    <div class="carousel-container">
      <button class="carousel-btn prev" @click="moveToPrevious">←</button>
      <div class="livros-wrapper">
        <div class="livros-container">
          <div v-for="(book, index) in visibleBooks" :key="book._id">
            <router-link v-if="book._id" :to="{ name: 'livroSolo', params: { id: book._id } }">
              <div class="livro-slot">
                <img v-if="book.coverImage" :src="`http://localhost:5000/${book.coverImage}`" :alt="book.title" class="livro-capa" />
                <p>{{ book.title }}</p>
                <p>{{ book.author }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
      <button class="carousel-btn next" @click="moveToNext">→</button>
    </div>
    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
    <hr class="separador" />
  </section>
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
.ultimos-adicionados {
  margin: 20px auto;
  width: 100%;
}

.titulo-carrossel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 10px;
}

.ver-todos {
  font-size: 14px;
  text-decoration: underline;
}

.carousel-container {
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.livros-wrapper {
  position: relative;
  display: flex;
  width: 100%;
}

.livros-container {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
  justify-content: space-between; /* Garantir espaçamento entre os itens */
}

.livro-slot {
  flex: 0 0 calc(25% - 10px); /* Mostra 4 itens por vez no PC */
  text-align: center;
  margin: 0 5px;
  box-sizing: border-box;
  border-radius: 10px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.livro-slot:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.livro-capa {
  width: 200px; /* Ajusta a largura para preencher o slot */
  height: 300px; /* Tamanho fixo para todas as imagens */
  object-fit: cover;
  border-radius: 5px;
}

.carousel-btn {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px;
  font-size: 20px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.carousel-btn.prev {
  left: 10px;
}

.carousel-btn.next {
  right: 10px;
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

.separador {
  width: 100%;
  border: 1px solid lightgray;
  margin: 20px 0 0 0;
}

/* Estilos responsivos */
@media (max-width: 1024px) {
  .livro-slot {
    flex: 0 0 calc(33.33% - 10px); /* Mostra 3 itens por vez no tablet */
  }
}

@media (max-width: 768px) {
  .livro-slot {
    flex: 0 0 calc(50% - 10px); /* Mostra 2 itens por vez no celular */
  }
}

@media (max-width: 480px) {
  .livro-slot {
    flex: 0 0 calc(100% - 10px); /* Mostra 1 item por vez em telas muito pequenas */
  }
}
</style>
