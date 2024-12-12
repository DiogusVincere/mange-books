<template>
  <div class="history-container" v-if="loanHistory.length">
    <h3>Histórico de Empréstimos</h3>
    <div v-for="loan in loanHistory" :key="loan.id">
      <p><strong>Título:</strong> {{ loan.book.title }}</p>
      <p><strong>ISBN:</strong> {{ loan.book.isbn }}</p>
      <router-link to="/bookloan"><a :href="'/book/' + loan.book.id">Ver mais</a></router-link>
    </div>
  </div>
  <div v-else>
    <p>Você não tem empréstimos registrados.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loanHistory: [], // Aqui armazenaremos os dados do histórico de empréstimos
    };
  },
  mounted() {
    this.fetchLoanHistory(); // Ao montar o componente, buscamos o histórico
  },
  methods: {
    async fetchLoanHistory() {
      try {
        const token = localStorage.getItem('token'); // Acesse o token JWT do localStorage
        if (token) {
          const response = await axios.get('http://localhost:5000/api/reservations/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          this.loanHistory = response.data; // Supondo que a resposta seja um array com os empréstimos
        } else {
          console.log("Token não encontrado");
        }
      } catch (error) {
        console.error('Erro ao buscar histórico de empréstimos:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Estilos Globais */
body {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    margin: 0;
    padding: 0;
}

h2, h3 {
    margin-bottom: 20px;
}

.profile-section, .address-section, .history-section {
    margin-bottom: 30px;
}

.profile-picture img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

.profile-info p, .address-section p, .history-section p {
    margin: 10px 0;
}

.buttons {
    margin-top: 20px;
}

button.btn {
    padding: 10px 15px;
    background-color: #FF3C00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-right: 10px;
}

button.active {
    background-color: #28a745; /* Verde para ativa */
}

button.inactive {
    background-color: #dc3545; /* Vermelho para inativa */
}

button:hover {
    opacity: 0.9;
}

.account-id {
    margin-top: 20px;
}

.status {
    font-weight: bold;
}

.status.active {
    color: green;
}

.status.inactive {
    color: red;
}

/* Histórico de Empréstimos na lateral direita */
.history-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>
