<template>
  <header>
    <div class="top-header">
      <div class="logo">
        <img src="@/assets/img/logosenai.png" alt="Logo Biblioteca Mange Book" />
        <span class="library-name">Biblioteca - Mange Book</span>
      </div>
      <div class="search-profile">
        <input
          type="text"
          placeholder="Buscar livros..."
          class="search-bar"
          v-model="searchQuery"
          @input="searchBooks"
        />
        <!-- Exibe os resultados da pesquisa -->
        <div v-if="searchResults.length > 0" class="search-results">
          <ul>
            <li v-for="book in searchResults" :key="book.id">
              <router-link :to="'/livro/' + book.id">{{ book.title }}</router-link>
            </li>
          </ul>
        </div>
        <div class="profile-actions">
          <a href="#" @click.prevent="navigateTo('profile')" class="profile-icon"><img src="@/assets/img/perfil.png" alt="Perfil" /></a>
          <template v-if="isLoggedIn">
            <span class="user-name">{{ username }}</span>
            <a href="#" @click.prevent="logout" class="auth-link">Sair</a>
          </template>
          <template v-else>
            <a href="#" @click.prevent="navigateTo('login')" class="auth-link">Entrar</a>
            ou
            <a href="#" @click.prevent="navigateTo('register')" class="auth-link">Cadastrar</a>
          </template>
          <a href="#" class="cart-icon"><img src="@/assets/img/carrinho-de-compras-de-design-xadrez.png" alt="Carrinho" /></a>
          <a href="#" class="favorites-icon"><img src="@/assets/img/favorito.png" alt="Favoritos" /></a>
        </div>
      </div>
    </div>
    <nav class="bottom-header">
      <ul>
        <li><router-link to="/" class="home-link">Home</router-link></li>
        <li><a href="#">Lançamentos</a></li>
        <li><router-link to="/catalogo" class="catalogo-link">Catálogo De Livros</router-link></li>
        <li><a href="#">Coleções e Séries</a></li>
      </ul>
    </nav>
  </header>
</template>

<script>
import axios from "axios";

export default {
  name: "Header",
  data() {
    return {
      isLoggedIn: false, // Estado do login
      username: "", // Nome do usuário logado
      searchQuery: "", // Texto da pesquisa
      searchResults: [], // Inicialize como um array vazio
    };
  },
  methods: {
    async fetchUserData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.username = response.data.username; // Define o nome do usuário
        this.isLoggedIn = true;
      } catch (error) {
        console.error("Erro ao obter dados do usuário:", error);
        this.isLoggedIn = false;
      }
    },
    logout() {
      localStorage.removeItem("token"); // Remove o token
      this.isLoggedIn = false;
      this.username = "";
      this.$router.push("/"); // Redireciona para a página inicial
    },
    navigateTo(page) {
      if (page === "profile" && this.isLoggedIn) {
        this.$router.push("/userprofile");
      } else if (page === "profile" && !this.isLoggedIn) {
        alert("Faça login para acessar o perfil.");
      } else {
        this.$router.push(`/${page}`);
      }
    },
    // Método para buscar livros
    async searchBooks() {
      if (this.searchQuery.trim() === "") {
        this.searchResults = []; // Se não houver consulta, esvaziar os resultados
        return;
      }
      
      try {
        const response = await axios.get(`/books/search?q=${this.searchQuery}`);
        this.searchResults = response.data.books || []; // Assegura que seja sempre um array
      } catch (error) {
        console.error("Erro ao buscar livros:", error);
        this.searchResults = []; // Limpar resultados em caso de erro
      }
    }
  },
  mounted() {
    this.fetchUserData(); // Busca os dados do usuário ao carregar o componente
  },
};
</script>

<style scoped>
/* Cabeçalho da página */
header {
  background-color: #FF1A0A;
  padding: 20px;
}

/* Parte superior do cabeçalho (logo, pesquisa, ícones) */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Permite que os itens sejam reorganizados em telas pequenas */
  gap: 10px; /* Espaçamento entre os itens */
}

/* Estilos para a logo e nome da biblioteca */
.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 50px;
  margin-right: 10px;
}

.library-name {
  font-size: 24px;
  font-weight: bold;
  color: white;
  white-space: nowrap; /* Evita quebra de linha */
}

/* Área da barra de pesquisa e ícones de perfil, carrinho, etc. */
.search-profile {
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* Reorganiza os itens em telas menores */
  gap: 10px; /* Espaçamento entre os itens */
}

.search-bar {
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  width: 300px;
  max-width: 100%; /* Ajusta a largura ao tamanho da tela */
}

/* Estilo para os resultados da pesquisa */
.search-results {
  position: absolute;
  background-color: white;
  width: 300px;
  max-width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.search-results ul {
  list-style: none;
  padding: 10px;
  margin: 0;
}

.search-results ul li {
  padding: 5px 0;
}

.search-results a {
  text-decoration: none;
  color: black;
}

.profile-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* Permite que os ícones quebrem linha */
  gap: 10px; /* Espaçamento entre os itens */
}

.profile-actions img {
  height: 30px;
}

.auth-link {
  margin: 0 5px;
  color: white;
}

/* Barra de navegação (menu) abaixo da parte superior */
.bottom-header {
  margin-top: 15px;
}

.bottom-header ul {
  list-style: none;
  display: flex;
  justify-content: space-around;
  padding: 0;
  flex-wrap: wrap; /* Reorganiza os itens em telas menores */
  gap: 10px; /* Espaçamento entre itens do menu */
}

.bottom-header ul li a {
  color: white;
  font-size: 18px;
  padding: 10px 20px;
  display: block; /* Garante clique em toda a área do link */
}

/* Estilos Responsivos */
@media (max-width: 768px) {
  .library-name {
    font-size: 20px;
  }

  .search-bar {
    width: 100%; /* Ocupa toda a largura disponível */
  }

  .profile-actions img {
    height: 25px;
  }

  .bottom-header ul li a {
    font-size: 16px;
    padding: 8px 15px;
  }
}

@media (max-width: 480px) {
  .logo img {
    height: 40px;
  }

  .library-name {
    font-size: 18px;
  }

  .search-bar {
    width: 100%;
    margin-right: 0; /* Remove margem lateral */
  }

  .profile-actions {
    justify-content: center; /* Centraliza os ícones */
  }

  .bottom-header ul {
    flex-direction: column; /* Transforma os itens do menu em uma lista vertical */
    align-items: center;
  }

  .bottom-header ul li a {
    padding: 10px;
  }
}
</style>
