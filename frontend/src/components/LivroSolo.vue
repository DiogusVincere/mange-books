<template>
  <div class="livro-solo">
    <div class="livro">
      <img :src="`http://localhost:5000/${livro.coverImage}`" :alt="livro.title" class="capa-livro">
      <div class="detalhes">
        <h2>{{ livro.title }}</h2>
        <p>Autor: {{ livro.author }}</p>
        <button @click="reservarLivro" class="reservar-btn">Reservar Livro</button>
      </div>
    </div>
    
    <div class="informacoes-barra">
      <div class="informacao">
        <img src="./img/paginas-icon.png" alt="Páginas">
        <span>{{ livro.pageCount }} páginas</span>
      </div>
      <div class="informacao">
        <img src="./img/tipo-capa-icon.png" alt="Tipo de Capa">
        <span>{{ livro.coverType }}</span>
      </div>
      <div class="informacao">
        <img src="./img/isbn-icon.png" alt="ISBN">
        <span>ISBN: {{ livro.isbn }}</span>
      </div>
    </div>

    <hr class="separador">

    <h3>Descrição do Livro</h3>
    <p>{{ livro.description }}</p>

    <hr class="separador">
    <div>
      <h3>Avaliações</h3>
      <div class="avaliacoes">
        <div v-for="avaliacao in livro.reviews" :key="avaliacao._id" class="avaliacao">
          <div class="usuario">
            <img :src="`http://localhost:5000/${avaliacao.userProfileImage}`" alt="Usuário" class="foto-perfil">
            <span class="nome-usuario">{{ avaliacao.userName }}</span>
          </div>
          <div class="estrelas">
            <span v-for="n in 5" :key="n" :class="n <= avaliacao.rating ? 'estrela preenchida' : 'estrela'">★</span>
          </div>
          <p class="comentario">{{ avaliacao.comment }}</p>
        </div>
      </div>
      <div v-if="userLoggedIn">
        <h4>Deixe sua avaliação</h4>
        <form @submit.prevent="submitReview">
          <div>
            <label for="rating">Nota (1-5)</label>
            <input type="number" v-model="newReview.rating" min="1" max="5" required />
          </div>
          <div>
            <label for="comment">Comentário</label>
            <textarea v-model="newReview.comment" required></textarea>
          </div>
          <button type="submit">Enviar Avaliação</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props:['id'], // Recebe o ID do livro pela rota
  name: 'LivroSolo',
  data() {
    return {
      livro: { reviews: [], reservedBy: null }, // Objeto do livro, com avaliações e reserva
      newReview: {
        rating: 1,
        comment: ''
      },
      userLoggedIn: false, // Verificar se o usuário está logado
    };
  },
  async created() {
    // Obter o ID do livro da URL
    const livroId = this.$route.params.id;
    try {
      const response = await axios.get(`http://localhost:5000/books/${livroId}`);
      this.livro = response.data;
    } catch (error) {
      console.error('Erro ao carregar os dados do livro:', error);
    }
  },
  mounted() {
    // Verifica se o usuário está logado
    this.userLoggedIn = Boolean(localStorage.getItem('token')); // Ou outro método de verificação de login
    this.fetchBookReviews();
  },
  methods: {
    async fetchBookReviews() {
      try {
        const response = await axios.get(`http://localhost:5000/books/${this.$route.params.id}`);
        this.livro = response.data;
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      }
    },
    async submitReview() {
      try {
        const response = await axios.post(
          'http://localhost:5000/reviews/addReview',
          {
            bookId: this.livro._id,
            rating: this.newReview.rating,
            comment: this.newReview.comment
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        console.log(response.data);
        this.fetchBookReviews();
        this.newReview.comment = '';
      } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
      }
    },
    async reservarLivro() {
      if (!this.userLoggedIn) {
        alert('Você precisa estar logado para reservar um livro.');
        return;
      }

      try {
        const response = await axios.post(
          `http://localhost:5000/api/reservations/reserve`,
          { bookId: this.livro._id }, // Envia o ID no corpo da requisição
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        alert(`Livro "${this.livro.title}" reservado com sucesso!`);
        this.livro.reservedBy = true; // Marca o livro como reservado no frontend
      } catch (error) {
        console.error('Erro ao reservar livro:', error);
        alert('Erro ao reservar o livro. Tente novamente mais tarde.');
      }
    }
  }
};
</script>

<style scoped>
.livro-solo {
  padding: 20px;
}

.livro {
  display: flex;
  margin-bottom: 20px;
}

.livro img {
  max-width: 200px;
  margin-right: 20px;
  border-radius: 8px;
}

.detalles h2 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.informacoes-barra {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.informacao {
  display: flex;
  align-items: center;
}

.informacao img {
  width: 20px;
  margin-right: 10px;
}

.separador {
  border-top: 2px solid #ccc;
  margin: 20px 0;
}

.avaliacoes {
  margin-top: 20px;
}

.avaliacao {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.estrelas {
  margin: 5px 0;
}

.estrela {
  color: #ddd;
}

.estrela.preenchida {
  color: #ff1a0a;
}

.foto-perfil {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.nome-usuario {
  font-weight: bold;
}

.comentario {
  font-style: italic;
}
</style>
