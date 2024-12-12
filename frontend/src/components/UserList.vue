<template>
  <div>
    <h1 class="title">Lista de Usuários</h1>
    <input 
      type="text" 
      v-model="searchQuery" 
      placeholder="Pesquise por Nome, CPF ou Email"
      class="search-input"
    />
    <div v-if="filteredUsers.length" class="user-container">
      <div 
        v-for="user in filteredUsers" 
        :key="user._id" 
        @click="goToDetails(user._id)"
        class="user-card"
      >
        <p><strong>Nome:</strong> {{ user.fullName }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>CPF:</strong> {{ user.cpf }}</p>
      </div>
    </div>
    <p v-else class="no-users">Nenhum usuário encontrado</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      users: [],
      searchQuery: "",
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter((user) => {
        const query = this.searchQuery.toLowerCase();
        return (
          user.fullName.toLowerCase().includes(query) ||
          user.cpf.includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      });
    },
  },
  methods: {
    fetchUsers() {
      axios.get("http://localhost:5000/api/auth")
        .then((response) => {
          this.users = response.data;
        })
        .catch((error) => {
          console.error("Erro ao buscar usuários:", error);
        });
    },
    goToDetails(id) {
      this.$router.push(`/users/${id}`);
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style>
/* Layout base */
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

.title {
  text-align: center;
  margin: 20px 0;
  color: #333;
}

.search-input {
  display: block;
  margin: 0 auto 20px;
  padding: 10px 15px;
  font-size: 16px;
  width: 60%;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #007BFF;
}

/* Container dos usuários */
.user-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.user-card {
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow: 5px 5px 10px #d6d6d6, -5px -5px 10px #ffffff;
  border-radius: 10px;
  padding: 20px;
  width: 300px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.user-card:hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 15px #c0c0c0, -5px -5px 15px #ffffff;
}

.user-card p {
  margin: 10px 0;
  font-size: 14px;
  color: #555;
}

.no-users {
  text-align: center;
  color: #888;
  font-size: 18px;
  margin-top: 20px;
}

/* Animações */
.user-card {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
