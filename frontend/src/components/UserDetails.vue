<template>
  <div>
    <!-- Cabeçalho -->
    <header class="header">
      <img src="@/assets/img/logosenai.png" alt="Logo SENAI" />
    </header>

    <!-- Conteúdo principal -->
    <main>
      <h1>Detalhes do Usuário</h1>

      <!-- Exibição dos detalhes do usuário -->
      <div v-if="user" class="user-details">
        <p><strong>Nome Completo:</strong> {{ user.fullName }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>CPF:</strong> {{ user.cpf }}</p>
        <p><strong>Data de Nascimento:</strong> {{ user.birthDate }}</p>
        <p><strong>Gênero:</strong> {{ user.gender }}</p>
        <p><strong>Telefone:</strong> {{ user.phone }}</p>
        <p><strong>Endereço:</strong> 
          {{ user.address.logradouro }}, {{ user.address.numero }}, 
          {{ user.address.bairro }}, {{ user.address.cidade }} - 
          {{ user.address.estado }}, CEP: {{ user.address.cep }}
        </p>
      </div>

      <!-- Botões de ações -->
      <div class="action-buttons">
        <button @click="showEditForm = !showEditForm" class="btn-edit">
          {{ showEditForm ? "Cancelar" : "Editar" }}
        </button>
        <button @click="deleteUser" class="btn-delete">Excluir</button>
      </div>

      <!-- Formulário de edição -->
      <transition name="fade">
        <div v-if="showEditForm" class="edit-form">
          <h2>Editar Usuário</h2>
          <form @submit.prevent="updateUser">
            <label>
              Nome Completo:
              <input type="text" v-model="editForm.fullName" />
            </label>
            <label>
              Email:
              <input type="email" v-model="editForm.email" />
            </label>
            <label>
              CPF:
              <input type="text" v-model="editForm.cpf" />
            </label>
            <label>
              Data de Nascimento:
              <input type="date" v-model="editForm.birthDate" />
            </label>
            <label>
              Gênero:
              <select v-model="editForm.gender">
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </label>
            <label>
              Telefone:
              <input type="text" v-model="editForm.phone" />
            </label>
            <label>
              Endereço:
              <input type="text" v-model="editForm.address.logradouro" placeholder="Logradouro" />
              <input type="text" v-model="editForm.address.numero" placeholder="Número" />
              <input type="text" v-model="editForm.address.bairro" placeholder="Bairro" />
              <input type="text" v-model="editForm.address.cidade" placeholder="Cidade" />
              <input type="text" v-model="editForm.address.estado" placeholder="Estado" />
              <input type="text" v-model="editForm.address.cep" placeholder="CEP" />
            </label>
            <button type="submit" class="btn-save">Salvar Alterações</button>
          </form>
        </div>
      </transition>

      <button @click="goBack" class="btn-back">Voltar</button>
    </main>

    <!-- Rodapé -->
    <footer class="footer">
      <p>© 2024 SENAI - Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: null,
      showEditForm: false,
      editForm: {
        fullName: "",
        email: "",
        cpf: "",
        birthDate: "",
        gender: "",
        phone: "",
        address: {
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
        },
      },
    };
  },
  methods: {
    fetchUserDetails() {
      const userId = this.$route.params.id;
      axios.get(`http://localhost:5000/api/auth/${userId}`)
        .then((response) => {
          this.user = response.data;
          this.populateEditForm();
        })
        .catch((error) => {
          console.error("Erro ao buscar detalhes do usuário:", error);
        });
    },
    populateEditForm() {
      if (this.user) {
        this.editForm = { ...this.user, address: { ...this.user.address } };
      }
    },
    updateUser() {
      const userId = this.$route.params.id;
      axios.put(`http://localhost:5000/api/auth/${userId}`, this.editForm)
        .then(() => {
          this.fetchUserDetails();
          this.showEditForm = false;
          alert("Usuário atualizado com sucesso!");
        })
        .catch((error) => {
          console.error("Erro ao atualizar usuário:", error);
        });
    },
    deleteUser() {
      const userId = this.$route.params.id;
      if (confirm("Tem certeza que deseja excluir este usuário?")) {
        axios.delete(`http://localhost:5000/api/auth/${userId}`)
          .then(() => {
            alert("Usuário excluído com sucesso!");
            this.$router.push("/users");
          })
          .catch((error) => {
            console.error("Erro ao excluir usuário:", error);
          });
      }
    },
    goBack() {
      this.$router.push("/users");
    },
  },
  mounted() {
    this.fetchUserDetails();
  },
};
</script>

<style scoped>
/* Cabeçalho */
.header {
  background-color: #ff3c00;
  padding: 10px 0;
  text-align: center;
  color: #fff;
}
.header img {
  height: 50px;
}

/* Rodapé */
.footer {
  background-color: #f2f2f2;
  text-align: center;
  padding: 10px;
  font-size: 14px;
}

/* Conteúdo principal */
main {
  padding: 20px;
}
.user-details {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Botões */
.action-buttons {
  display: flex;
  gap: 10px;
}
.btn-edit,
.btn-delete,
.btn-save,
.btn-back {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.btn-edit:hover {
  background-color: #45a049;
  transform: scale(1.05);
}
.btn-delete:hover {
  background-color: #e53935;
  transform: scale(1.05);
}
.btn-save:hover {
  background-color: #007bb5;
  transform: scale(1.05);
}
.btn-back:hover {
  background-color: #444;
  transform: scale(1.05);
}

/* Formulário */
.edit-form label {
  display: block;
  margin: 10px 0;
}
.edit-form input,
.edit-form select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.edit-form button {
  margin-top: 10px;
}

/* Animações */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
