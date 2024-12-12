<template>
  <div>
    <!-- Header -->
    <header class="header">
      <img src="../assets/img/logosenai.png" alt="Logo SENAI" />
      <div class="support-info">
        <span>Divisão2 Ltda</span> | <span>(19) 3772-1840</span>
      </div>
    </header>

    <!-- Conteúdo principal -->
    <div class="register-container">
      <form @submit.prevent="submitUser">
        <!-- Primeira Parte: Dados de Acesso -->
        <div class="step">
          <h2>Dados de Acesso</h2>
          <div>
            <label for="username">Apelido:</label>
            <input type="text" v-model="formData.username" id="username" required />
          </div>
          <div>
            <label for="email">E-mail:</label>
            <input type="email" v-model="formData.email" id="email" required />
          </div>
          <div>
            <label for="password">Senha:</label>
            <input type="password" v-model="formData.password" id="password" required />
          </div>
          <div>
            <label for="confirmPassword">Confirmar Senha:</label>
            <input type="password" v-model="formData.confirmPassword" id="confirmPassword" required />
          </div>
        </div>

        <!-- Segunda Parte: Dados Cadastrais -->
        <div class="step">
          <h2>Dados Cadastrais</h2>
          <div>
            <label for="fullName">Nome Completo:</label>
            <input type="text" v-model="formData.fullName" id="fullName" required />
          </div>
          <div>
            <label for="birthDate">Data de Nascimento:</label>
            <input type="date" v-model="formData.birthDate" id="birthDate" required />
          </div>
          <div>
            <label for="gender">Gênero:</label>
            <select v-model="formData.gender" id="gender" required>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label for="cpf">CPF:</label>
            <input type="text" v-model="formData.cpf" id="cpf" required />
          </div>
          <div>
            <label for="phone">Telefone:</label>
            <input type="text" v-model="formData.phone" id="phone" required />
          </div>
        </div>

        <!-- Terceira Parte: Dados de Endereço -->
        <div class="step">
          <h2>Dados de Endereço</h2>
          <div>
            <label for="cep">CEP:</label>
            <input type="text" v-model="formData.address.cep" id="cep" required />
          </div>
          <div>
            <button type="button" @click="preencherEndereco">Preencher Endereço</button>
          </div>
          <div>
            <label for="logradouro">Logradouro:</label>
            <input type="text" v-model="formData.address.logradouro" id="logradouro" disabled />
          </div>
          <div>
            <label for="bairro">Bairro:</label>
            <input type="text" v-model="formData.address.bairro" id="bairro" disabled />
          </div>
          <div>
            <label for="cidade">Cidade:</label>
            <input type="text" v-model="formData.address.cidade" id="cidade" disabled />
          </div>
          <div>
            <label for="estado">Estado:</label>
            <input type="text" v-model="formData.address.estado" id="estado" disabled />
          </div>
          <div>
            <label for="numero">Número:</label>
            <input type="text" v-model="formData.address.numero" id="numero" required />
          </div>
        </div>

        <!-- Botão Concluir Cadastro -->
        <div class="step">
          <button type="submit">Concluir Cadastro</button>
        </div>

        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success">{{ successMessage }}</div>
      </form>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 - Editora Blucher - Todos os direitos reservados.</p>
        <p>Rua Pedroso Alvarenga, 1245, 4º andar - São Paulo - SP, CEP: 04531-904, (11) 3078-5366</p>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      formData: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        birthDate: "",
        gender: "Masculino",
        cpf: "",
        phone: "",
        address: {
          cep: "",
          logradouro: "",
          bairro: "",
          cidade: "",
          estado: "",
          numero: "",
        },
      },
      errorMessage: null,
      successMessage: null,
    };
  },
  methods: {
    async preencherEndereco() {
      const cep = this.formData.address.cep;
      if (!cep || cep.length !== 8) {
        alert("CEP inválido!");
        return;
      }

      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) {
          alert("CEP não encontrado!");
          return;
        }
        this.formData.address.logradouro = response.data.logradouro;
        this.formData.address.bairro = response.data.bairro;
        this.formData.address.cidade = response.data.localidade;
        this.formData.address.estado = response.data.uf;
      } catch (error) {
        alert("Erro ao preencher o endereço.");
      }
    },
    async submitUser() {
      if (this.formData.password !== this.formData.confirmPassword) {
        this.errorMessage = "As senhas não coincidem!";
        this.successMessage = null;
        return;
      }

      const formData = {
        username: this.formData.username,
        email: this.formData.email,
        password: this.formData.password,
        confirmPassword: this.formData.confirmPassword,
        fullName: this.formData.fullName,
        birthDate: this.formData.birthDate,
        gender: this.formData.gender,
        cpf: this.formData.cpf,
        phone: this.formData.phone,
        address: {
            cep: this.formData.address.cep,
            logradouro: this.formData.address.logradouro,
            bairro: this.formData.address.bairro,
            cidade: this.formData.address.cidade,
            estado: this.formData.address.estado,
            numero: this.formData.address.numero,
        },
      };

      try {
          const response = await axios.post("http://localhost:5000/api/auth/register", formData, {
              headers: {
                  "Content-Type": "application/json",
              },
           });

           if (response.status === 201) {
               this.successMessage = "Cadastro realizado com sucesso!";
               this.errorMessage = null;
               this.$router.push("/login");
           }
       } catch (error) {
           this.errorMessage = error.response?.data?.message || "Erro ao cadastrar usuário.";
           this.successMessage = null;
       }
    },
  },
};
</script>

<style scoped>
/* Configurações gerais */
body {
  font-family: "Arial", sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(to bottom, #ffffff, #f3f3f3);
  color: #333;
}

.register-container {
  width: 60%;
  margin: 50px auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 1s ease-in-out;
}

.step {
  padding: 20px;
}

.step h2 {
  margin-bottom: 20px;
  font-size: 1.5em;
  color: #333;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, button {
  width: 95%;
  padding: 10px;
  margin-bottom: 15px;
  margin-right: 50px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  transition: 0.3s ease;
}

input:focus, select:focus {
  border-color: #ff1a0a;
  box-shadow: 0 0 5px rgba(255, 26, 10, 0.5);
  outline: none;
}

/* Botões */
button {
  background: linear-gradient(45deg, #ff1a0a, #e01909);
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(255, 26, 10, 0.3);
}

button:active {
  transform: scale(0.98);
  box-shadow: none;
}

/* Mensagens de erro e sucesso */
.error, .success {
  text-align: center;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.error {
  background: #ffdddd;
  color: #d8000c;
  border: 1px solid #d8000c;
}

.success {
  background: #ddffdd;
  color: #4f8a10;
  border: 1px solid #4f8a10;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(45deg, #ff1a0a, #e01909);
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header img {
  height: 50px;
}

.support-info {
  font-size: 14px;
  font-weight: bold;
}

/* Footer */
.footer {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(45deg, #ff1a0a, #e01909);
  color: white;
  text-align: center;
  font-size: 0.9em;
}

.footer-content p {
  margin: 5px 0;
}

/* Animações */
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

/* Responsividade */
@media (max-width: 768px) {
  .register-container {
    width: 90%;
  }

  input, select, button {
    font-size: 0.9em;
  }

  .step h2 {
    font-size: 1.2em;
  }
}
</style>

