<template>
  <!-- Container principal para exibição das reservas e empréstimos -->
  <div class="reservations-container">
    <!-- Título da página -->
    <h1>Reservas e Empréstimos</h1>

    <!-- Tabela para exibir as reservas e empréstimos -->
    <table>
      <thead>
        <!-- Cabeçalho da tabela -->
        <tr>
          <th>Nome do Usuário</th>
          <th>CPF</th>
          <th>Nome do Livro</th>
          <th>ISBN</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <!-- Linha de "nenhuma reserva" caso não haja dados -->
        <tr v-if="reservations.length === 0">
          <td colspan="6" style="text-align: center;">Não há reservas ou empréstimos registrados.</td>
        </tr>
        <!-- Loop para listar cada reserva -->
        <tr v-for="reservation in reservations" :key="reservation._id">
          <!-- Nome do usuário com link para detalhes -->
          <td>
            <router-link :to="`/user/${reservation.user._id}`">
              {{ reservation.user.fullName }}
            </router-link>
          </td>
          <!-- Exibe o CPF do usuário -->
          <td>{{ reservation.user.cpf }}</td>
          <!-- Nome do livro com link para detalhes -->
          <td>
            <router-link :to="`/book/${reservation.book._id}`">
              {{ reservation.book.title }}
            </router-link>
          </td>
          <!-- Exibe o ISBN do livro -->
          <td>{{ reservation.book.isbn }}</td>
          <!-- Exibe o status da reserva (Reservado/Emprestado) -->
          <td>{{ reservation.status }}</td>
          <!-- Ações para alterar o status da reserva -->
          <td>
            <!-- Botão de empréstimo, visível se o status for 'Reservado' -->
            <button v-if="reservation.status === 'Reservado'" @click="loanBook(reservation._id)">
              Emprestar
            </button>
            <!-- Botão de devolução, visível se o status for 'Emprestado' -->
            <button v-if="reservation.status === 'Emprestado'" @click="returnBook(reservation._id)">
              Livro Devolvido
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
// Importa a biblioteca axios para fazer requisições HTTP
import axios from 'axios';

export default {
  data() {
    return {
      reservations: [], // Armazena as reservas e empréstimos
    };
  },
  methods: {
    // Método para buscar as reservas e empréstimos da API
    async fetchReservations() {
      try {
        const response = await axios.get('http://localhost:5000/api/reservations/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Adiciona o token de autenticação
          },
        });
        console.log('Resposta da API:', response.data); // Log para verificar os dados recebidos
        this.reservations = response.data; // Armazena as reservas retornadas
      } catch (error) {
        console.error('Erro ao buscar reservas:', error); // Log de erro
        alert('Não foi possível carregar as reservas. Tente novamente mais tarde.'); // Exibe alerta em caso de erro
      }
    },
    // Método para emprestar um livro
    async loanBook(reservationId) {
      try {
        await axios.post(
          'http://localhost:5000/api/reservations/loan',
          { reservationId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Envia o token de autenticação
            },
          }
        );
        alert('Livro emprestado com sucesso!'); // Exibe alerta de sucesso
        this.fetchReservations(); // Atualiza a lista de reservas
      } catch (error) {
        console.error('Erro ao emprestar livro:', error); // Log de erro
        alert('Erro ao emprestar o livro. Tente novamente mais tarde.'); // Alerta em caso de erro
      }
    },
    // Método para devolver um livro
    async returnBook(reservationId) {
      try {
        await axios.post(
          'http://localhost:5000/api/reservations/return',
          { reservationId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Envia o token de autenticação
            },
          }
        );
        alert('Livro devolvido com sucesso!'); // Alerta de sucesso
        this.fetchReservations(); // Atualiza a lista de reservas
      } catch (error) {
        console.error('Erro ao devolver livro:', error); // Log de erro
        alert('Erro ao devolver o livro. Tente novamente mais tarde.'); // Alerta de erro
      }
    },
  },
  mounted() {
    this.fetchReservations(); // Chama o método para buscar as reservas ao carregar o componente
  },
};
</script>

<style scoped>
/* Estilo para o container principal */
.reservations-container {
  margin: 20px;
}

/* Estilo para o título da página */
h1 {
  text-align: center;
}

/* Estilo para a tabela */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

/* Estilo para o cabeçalho da tabela */
thead {
  background-color: #f5f5f5;
}

/* Estilo para células da tabela */
td, th {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

/* Estilo para os botões de ação */
button {
  padding: 5px 10px;
  margin: 5px;
  border: none;
  background-color: #007bff; /* Cor de fundo do botão */
  color: white; /* Cor do texto */
  cursor: pointer; /* Muda o cursor para indicar que é clicável */
}

/* Estilo para os botões ao passar o mouse por cima */
button:hover {
  background-color: #0056b3; /* Cor de fundo quando o mouse passa sobre o botão */
}
</style>