<template>
  <div class="content" v-if="userProfile">
    <div class="container">
      <h2>Detalhes da Conta</h2>
      <div class="profile-section">
        <div class="profile-picture">
          <img src="@/assets/img/perfil.png" alt="Foto do Usuário" />
        </div>
        <div class="profile-info">
          <p><strong>Nome completo:</strong> {{ formatarCampo(userProfile.fullName) }}</p>
          <p><strong>Perfil:</strong> {{ formatarCampo(userProfile.role, 'Usuário') }}</p>
          <p><strong>Data de Nascimento:</strong> {{ formatarData(userProfile.birthDate) }}</p>
          <p><strong>Gênero:</strong> {{ formatarCampo(userProfile.gender) }}</p>
          <p><strong>CPF:</strong> {{ formatarCampo(userProfile.cpf) }}</p>
          <p><strong>Email:</strong> {{ formatarCampo(userProfile.email) }}</p>
          <p><strong>Status da Conta:</strong> 
            <span :class="['status', userProfile.isActive ? 'active' : 'inactive']">
              {{ userProfile.isActive ? 'Ativa' : 'Inativa' }}
            </span>
          </p>
        </div>
      </div>
      <div class="address-section">
        <h3>Endereço</h3>
        <p><strong>Logradouro:</strong> {{ formatarCampo(userProfile.address?.logradouro) }}</p>
        <p><strong>Número:</strong> {{ formatarCampo(userProfile.address?.numero) }}</p>
        <p><strong>Bairro:</strong> {{ formatarCampo(userProfile.address?.bairro) }}</p>
        <p><strong>Cidade:</strong> {{ formatarCampo(userProfile.address?.cidade) }}</p>
        <p><strong>Estado:</strong> {{ formatarCampo(userProfile.address?.estado) }}</p>
        <p><strong>CEP:</strong> {{ formatarCampo(userProfile.address?.cep) }}</p>
      </div>
    </div>
  </div>
  <div v-else class="loading">Carregando...</div>
</template>

<script>
import api from '@/api';

export default {
  name: 'UserProfile',
  data() {
    return {
      userProfile: null,
    };
  },
  mounted() {
    this.carregarPerfil();
  },
  methods: {
    async carregarPerfil() {
      try {
        const response = await api.get('/me');
        this.userProfile = response.data;
        console.log('Perfil carregado:', this.userProfile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        alert('Erro ao carregar perfil: ' + error.message);
      }
    },
    formatarData(data) {
      if (!data) return 'Não informado';
      const date = new Date(data);
      return isNaN(date) ? 'Data inválida' : date.toLocaleDateString();
    },
    formatarCampo(valor, padrao = 'Não informado') {
      return valor || padrao;
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

.user-info p {
    font-weight: bold;
    margin-bottom: 10px;
}

.logout {
    color: red;
    text-decoration: none;
}

.content {
    flex: 1;
    padding: 20px;
}

.container {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: grid;
    place-items: center;
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
</style>
  