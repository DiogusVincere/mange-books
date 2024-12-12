<template>
  <div class="catalogo">
    <aside class="generos-livros">
      <h2>Gêneros Disponíveis</h2>
      <ul>
        <li
          v-for="genero in generos"
          :key="genero"
          @click="filtrarLivrosPorGenero(genero)"
          :class="{ ativo: generoSelecionado === genero }"
        >
          {{ genero }}
        </li>
      </ul>
    </aside>

    <section class="catalogo-livros">
      <h2>Catálogo de Livros</h2>
      <div v-if="livros.length === 0">
        <p>Nenhum livro encontrado para o gênero selecionado.</p>
      </div>
      <div class="livros" v-else>
        <div class="livro" v-for="livro in livros" :key="livro._id">
          <div class="livro-content">
            <!-- Fechando corretamente o router-link -->
            <router-link :to="{ name: 'livroSolo', params: { id: livro._id } }">
              <img :src="`http://localhost:5000/${livro.coverImage}`" :alt="livro.title" />
              <h4>{{ livro.title }}</h4>
              <p>{{ livro.author }}</p>
            </router-link> <!-- Fechando o router-link aqui -->
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CatalogoLivros",
  data() {
    return {
      livros: [],
      todosLivros: [],
      generos: ["Fantasia", "Terror", "Drama", "Suspense", "Ação", "Ficção"],
      generoSelecionado: null,
    };
  },
  methods: {
    async carregarLivros() {
      try {
        const response = await axios.get("http://localhost:5000/books");
        this.todosLivros = response.data;
        this.livros = this.todosLivros;
      } catch (error) {
        console.error("Erro ao carregar os livros:", error);
      }
    },
    filtrarLivrosPorGenero(genero) {
      this.generoSelecionado = genero;
      if (genero) {
        this.livros = this.todosLivros.filter((livro) => livro.genre === genero);
      } else {
        this.livros = this.todosLivros;
      }
    },
  },
  mounted() {
    this.carregarLivros();
  },
};
</script>

<style scoped>
.catalogo {
  display: flex;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.generos-livros {
  width: 25%;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.generos-livros h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.generos-livros ul {
  list-style: none;
  padding: 0;
}

.generos-livros li {
  cursor: pointer;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
  background-color: white;
  transition: all 0.3s ease;
}

.generos-livros li:hover {
  background-color: #ff1a0a;
  color: white;
}

.generos-livros li.ativo {
  background-color: #ff1a0a;
  color: white;
}

.catalogo-livros {
  width: 75%;
}

.catalogo-livros h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.livros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.livro {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.livro:hover {
  transform: translateY(-5px);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3);
}

.livro-content {
  padding: 15px;
  text-align: center;
}

.livro img {
  width: 200px; /* Ajusta a largura para preencher o slot */
  height: 300px;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

.livro h4 {
  font-size: 16px;
  color: #333;
  margin: 10px 0 5px;
}

.livro p {
  font-size: 14px;
  color: #777;
}

@media (max-width: 768px) {
  .catalogo {
    flex-direction: column;
  }

  .generos-livros {
    width: 100%;
    margin-bottom: 20px;
  }

  .catalogo-livros {
    width: 100%;
  }
}
</style>
