<template>
  <div class="reservations-container">
    <h1>Reservas e Empréstimos</h1>

    <table>
      <thead>
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
        <tr v-if="reservations.length === 0">
          <td colspan="6" style="text-align: center;">Não há reservas ou empréstimos registrados.</td>
        </tr>
        <tr v-for="reservation in reservations" :key="reservation._id">
          <td>
            <router-link :to="`/user/${reservation.user._id}`">
              {{ reservation.user.fullName }}
            </router-link>
          </td>
          <td>{{ reservation.user.cpf }}</td>
          <td>
            <router-link :to="`/book/${reservation.book._id}`">
              {{ reservation.book.title }}
            </router-link>
          </td>
          <td>{{ reservation.book.isbn }}</td>
          <td>{{ reservation.status }}</td>
          <td>
            <button v-if="reservation.status === 'Reservado'" @click="loanBook(reservation._id)">
              Emprestar
            </button>
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
import axios from 'axios';

export default {
  data() {
    return {
      reservations: [],
    };
  },
  methods: {
    async fetchReservations() {
      try {
        const response = await axios.get('http://localhost:5000/api/reservations/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Resposta da API:', response.data); // Adicione isso para verificar os dados
        this.reservations = response.data;
      } catch (error) {
        console.error('Erro ao buscar reservas:', error);
        alert('Não foi possível carregar as reservas. Tente novamente mais tarde.');
      }
    },
    async loanBook(reservationId) {
      try {
        await axios.post(
          'http://localhost:5000/api/reservations/loan',
          { reservationId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        alert('Livro emprestado com sucesso!');
        this.fetchReservations(); // Atualiza a lista
      } catch (error) {
        console.error('Erro ao emprestar livro:', error);
        alert('Erro ao emprestar o livro. Tente novamente mais tarde.');
      }
    },
    async returnBook(reservationId) {
      try {
        await axios.post(
          'http://localhost:5000/api/reservations/return',
          { reservationId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        alert('Livro devolvido com sucesso!');
        this.fetchReservations(); // Atualiza a lista
      } catch (error) {
        console.error('Erro ao devolver livro:', error);
        alert('Erro ao devolver o livro. Tente novamente mais tarde.');
      }
    },
  },
  mounted() {
    this.fetchReservations();
  },
};
</script>

<style scoped>
.reservations-container {
  margin: 20px;
}

h1 {
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

thead {
  background-color: #f5f5f5;
}

td, th {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

button {
  padding: 5px 10px;
  margin: 5px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
