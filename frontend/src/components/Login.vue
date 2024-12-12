<template>
    <div>
      <!-- Cabeçalho -->
      <header>
        <div class="logo-container">
          <img src="../assets/img/logosenai.png" alt="Logo Senai" class="logo" />
          <div class="support-info">
            <p>Dúvidas? Ligue <strong>(19) 3772-1840</strong></p>
          </div>
        </div>
      </header>
  
      <!-- Conteúdo de Login e Registro -->
      <div class="login-container">
        <!-- Caixa de Login -->
        <div class="login-box">
          <h3>VOCÊ JÁ É NOSSO CLIENTE?</h3>
          <form @submit.prevent="login">
            <div class="input-container">
              <input
                type="email"
                v-model="email"
                placeholder="Informe seu e-mail"
                required
              />
            </div>
            <div class="input-container">
              <input
                type="password"
                v-model="password"
                placeholder="Informe sua senha"
                required
              />
            </div>
            <button type="submit">Entrar</button>
          </form>
          <a href="#" class="forgot-password">Esqueci minha senha</a>
        </div>
  
        <!-- Separador -->
        <div class="separator"></div>
  
        <!-- Caixa de Registro -->
        <div class="register-box">
          <h3>Ainda não sou cliente</h3>
          <p>
            Além de receber benefícios exclusivos tenho praticidade nos nossos
            fluxos!
          </p>
          <button class="register-btn" @click="register">
            Quero me cadastrar
          </button>
        </div>
      </div>
  
      <!-- Rodapé -->
      <footer>
        <p>
          Copyright 2024 - Editora Blucher - Todos direitos reservados.<br />
          Rua Pedroso Alvarenga, 1245, 4º andar - São Paulo - SP, CEP:
          04531-904.<br />
          (11) 3078-5366
        </p>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: "LoginPage",
    data() {
      return {
        email: "",
        password: "",
      };
    },
    methods: {
      async login() {
        try {
          const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
           },
           body: JSON.stringify({
              email: this.email,
              password: this.password,
           }),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.message || "Erro ao realizar login.");
          return;
        }

        const data = await response.json();
        localStorage.setItem("token", data.token); // Salva o token
        alert("Login realizado com sucesso!");
        console.log("Token:", data.token);
        // Redirecione para outra página após o login
        this.$router.push("/");
      } catch (error) {
        console.error("Erro durante o login:", error);
        alert("Ocorreu um erro inesperado.");
      }
    },
    register() {
      // Redirecionar para a página de cadastro
      this.$router.push("/register");
    },
  },
};
  </script>
  
  <style scoped>
  /* Estilização correspondente ao CSS fornecido */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
  }
  
  body {
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  header {
    background-color: #ffffff;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
  }
  
  .logo {
    width: 150px;
  }
  
  .support-info p {
    font-size: 14px;
    color: #333;
  }
  
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    padding: 40px;
    position: relative;
  }
  
  .login-box,
  .register-box {
    background-color: #ffffff;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombreamento */
    margin: 10px;
    width: 300px;
    border-radius: 8px; /* Bordas arredondadas */
  }
  
  .login-box {
    background-color: #f2f2f2; /* Cor de fundo cinza escuro */
  }
  
  .login-box h3 {
    font-size: 18px;
    margin-bottom: 20px;
    color: #333; /* Texto escuro */
  }
  
  .input-container {
    margin-bottom: 20px;
  }
  
  .input-container input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
  
  button:hover {
    background-color: #218838;
  }
  
  .forgot-password {
    display: block;
    text-align: center;
    margin-top: 10px;
    color: #666;
    font-size: 14px;
  }
  
  .separator {
    width: 1px;
    background-color: #ddd; /* Linha cinza clara */
    height: 240px; /* Altura igual à altura dos boxes */
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .register-box p {
    margin: 10px 0;
    font-size: 14px;
    color: #666;
  }
  
  .register-btn {
    background-color: #28a745;
    color: white;
    padding: 10px;
    border: none;
    width: 100%;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  footer {
    background-color: #ff1a0a;
    padding: 10px;
    text-align: center;
    color: white;
    font-size: 12px;
    line-height: 1.5;
  }
  </style>
  