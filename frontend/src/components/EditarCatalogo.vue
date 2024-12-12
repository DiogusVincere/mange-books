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
              <router-link :to="{ name: 'livroSolo', params: { id: livro._id } }">
                <img :src="`http://localhost:5000/${livro.coverImage}`" :alt="livro.title" />
                <h4>{{ livro.title }}</h4>
                <p>{{ livro.author }}</p>
              </router-link>
              <!-- Botões de Editar e Deletar -->
              <button @click="abrirFormularioEdicao(livro)">Editar</button>
              <button @click="deletarLivro(livro._id)">Deletar</button>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Modal para edição -->
      <div v-if="livroSelecionado" class="modal">
        <div class="modal-content">
          <h2>Editar Livro</h2>
          <form @submit.prevent="atualizarLivro">
            <label for="title">Título:</label>
            <input v-model="livroSelecionado.title" id="title" type="text" required />
  
            <label for="author">Autor:</label>
            <input v-model="livroSelecionado.author" id="author" type="text" required />
  
            <label for="description">Descrição:</label>
            <textarea v-model="livroSelecionado.description" id="description" required></textarea>
  
            <label for="year">Ano:</label>
            <input v-model.number="livroSelecionado.year" id="year" type="number" required />
  
            <label for="genre">Gênero:</label>
            <select v-model="livroSelecionado.genre" id="genre" required>
              <option v-for="genero in generos" :key="genero" :value="genero">{{ genero }}</option>
            </select>
  
            <label for="pageCount">Quantidade de Páginas:</label>
            <input v-model.number="livroSelecionado.pageCount" id="pageCount" type="number" required />
  
            <label for="coverType">Tipo de Capa:</label>
            <select v-model="livroSelecionado.coverType" id="coverType" required>
              <option value="Dura">Dura</option>
              <option value="Mole">Mole</option>
            </select>
  
            <label for="isbn">ISBN:</label>
            <input v-model="livroSelecionado.isbn" id="isbn" type="text" required />
  
            <label for="coverImage">Capa do Livro:</label>
            <input type="file" @change="alterarCapaLivro" id="coverImage" />
            <p v-if="livroSelecionado.coverImage">Imagem atual: <img :src="`http://localhost:5000/${livroSelecionado.coverImage}`" alt="Capa do livro" style="max-width: 100px; margin-top: 10px;" /></p>
  
            <button type="submit">Salvar</button>
            <button type="button" @click="fecharFormularioEdicao">Cancelar</button>
          </form>
        </div>
      </div>
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
        livroSelecionado: null, // Armazena o livro a ser editado
        livroParaEditar: null, // Para armazenar a imagem do livro para editar
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
      abrirFormularioEdicao(livro) {
        this.livroSelecionado = { ...livro }; // Cria uma cópia do livro
        this.livroParaEditar = { ...livro }; // Mantém o livro original para comparação
      },
      fecharFormularioEdicao() {
        this.livroSelecionado = null;
        this.livroParaEditar = null;
      },
      async atualizarLivro() {
        try {
          // Atualiza a capa se houver uma nova imagem
          const formData = new FormData();
          if (this.livroSelecionado.coverImageFile) {
            formData.append("coverImage", this.livroSelecionado.coverImageFile);
          }
  
          formData.append("title", this.livroSelecionado.title);
          formData.append("author", this.livroSelecionado.author);
          formData.append("description", this.livroSelecionado.description);
          formData.append("year", this.livroSelecionado.year);
          formData.append("genre", this.livroSelecionado.genre);
          formData.append("pageCount", this.livroSelecionado.pageCount);
          formData.append("coverType", this.livroSelecionado.coverType);
          formData.append("isbn", this.livroSelecionado.isbn);
  
          const response = await axios.put(
            `http://localhost:5000/books/${this.livroSelecionado._id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("Livro atualizado:", response.data);
          this.carregarLivros(); // Atualiza a lista de livros
          this.fecharFormularioEdicao();
        } catch (error) {
          console.error("Erro ao atualizar o livro:", error);
        }
      },
      alterarCapaLivro(event) {
        const file = event.target.files[0];
        if (file) {
          this.livroSelecionado.coverImageFile = file;
        }
      },
      async deletarLivro(id) {
        try {
          await axios.delete(`http://localhost:5000/books/${id}`);
          console.log("Livro deletado:", id);
          this.carregarLivros(); // Atualiza a lista de livros
        } catch (error) {
          console.error("Erro ao deletar o livro:", error);
        }
      },
    },
    mounted() {
      this.carregarLivros();
    },
  };
</script>
  
<style scoped>
/* Estilo do modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 20px;
}

.modal-content form label {
  display: block;
  margin-top: 10px;
}

.modal-content form input,
.modal-content form textarea,
.modal-content form select {
  width: 100%;
  margin-top: 5px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-content form button {
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  background-color: #ff1a0a;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

.modal-content form button:last-of-type {
  background-color: #ccc;
  margin-left: 10px;
}

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

button {
  background-color: #ff1a0a;
  border: none;
  padding: 5px 10px;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
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
  