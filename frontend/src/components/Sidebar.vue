<template>
  <aside class="sidebar">
    <div class="user-info">
      <p>Olá, {{ username }}!</p>
      <a href="#" class="logout" @click="handleLogout">Sair</a>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li><router-link to="/" class="home-link"><a>Home</a></router-link></li>
        <li><router-link to="/userprofile" class='user-link'><a>Minha Conta</a></router-link></li>
      </ul>
      <hr />
      <ul>
        <li><a href="#">Favoritos</a></li>
        <li><a href="#">Loja</a></li>
      </ul>
      <hr />
      <ul>
        <li><router-link to="/editarcatalogo" class="editarcatalogo-link"><a>Editar Catálogo</a></router-link></li>
        <li><router-link to="/cadastrarlivro" class="cadastrarlivro-link"><a>Cadastrar Livro</a></router-link></li>
        <li><router-link to="/users" class="users-link"><a>Gerir Usuários</a></router-link></li>
        <li><router-link to="/bookloan" class="bookloan-link"><a>Empréstimos</a></router-link></li>
        <li><router-link to="/relatorios" class="relatorios-link"><a>Relatórios</a></router-link></li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  data() {
    return {
      username: "Carregando...", // Valor padrão enquanto o username carrega
    };
  },
  mounted() {
    this.fetchUserData(); // Carrega os dados do usuário ao montar o componente
  },
  methods: {
    async fetchUserData() {
      try {
        // Simulação de uma chamada ao backend para obter o nome do usuário
        const response = await fetch("http://localhost:5000/api/auth", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Adiciona o token na requisição
          },
        });

        if (!response.ok) throw new Error("Erro ao carregar os dados do usuário");

        const data = await response.json();
        this.username = data.username || "Usuário"; // Atualiza o nome do usuário
      } catch (error) {
        console.error(error);
        this.username = "Visitante";
      }
    },
    handleLogout() {
      // Remove o token e redireciona para a página inicial
      localStorage.removeItem("token");
      this.$router.push("/"); // Redireciona para a página inicial
    },
  },
};
</script>
  
  <style scoped>
  /* Reset de estilos básicos */
  body {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    margin: 0;
    padding: 0;
    display: flex; /* Adiciona layout flexível ao body */
  }
  
  /* Sidebar */
  .sidebar {
    width: 250px; /* Largura fixa */
    background-color: #282828;
    color: #fff;
    padding: 20px;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    min-height: 100vh; /* Ocupa toda a altura da janela */
  }
  
  /* Estilo do conteúdo da sidebar */
  .user-info {
    font-size: 18px;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .user-info p {
    margin: 0;
  }
  
  .logout {
    color: #FF3C00;
    font-weight: bold;
    margin-top: 10px;
  }
  
  .sidebar-nav ul {
    list-style-type: none;
    padding: 0;
  }
  
  .sidebar-nav ul li {
    margin-bottom: 15px;
    margin-right: 50px;
  }
  
  .sidebar-nav ul li a {
    color: #ddd;
    display: block;
    padding: 10px 15px;
    background-color: #333;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .sidebar-nav ul li a:hover {
    background-color: #444;
  }
  
  .sidebar hr {
    border: none;
    border-bottom: 1px solid #444;
    margin: 15px 0;
  }
  </style>
  
  