<template>
  <div class="book-form">
    <h2>{{ isEditing ? "Editar Livro" : "Adicionar Novo Livro" }}</h2>
    <form @submit.prevent="submitBook">
      <div>
        <label for="title">Título</label>
        <input type="text" id="title" v-model="book.title" required />
      </div>

      <div>
        <label for="author">Autor</label>
        <input type="text" id="author" v-model="book.author" required />
      </div>

      <div>
        <label for="description">Descrição</label>
        <textarea
          id="description"
          v-model="book.description"
          rows="5"
          style="width: 100%; resize: none;"
          placeholder="Escreva aqui a descrição do livro"
          required
        ></textarea>
      </div>

      <div>
        <label for="year">Ano</label>
        <input type="number" id="year" v-model="book.year" required />
      </div>

      <div>
        <label for="genre">Gênero</label>
        <select id="genre" v-model="book.genre" required>
          <option value="" disabled>Selecione um gênero</option>
          <option value="Fantasia">Fantasia</option>
          <option value="Terror">Terror</option>
          <option value="Drama">Drama</option>
          <option value="Suspense">Suspense</option>
          <option value="Ação">Ação</option>
          <option value="Ficção">Ficção</option>
        </select>
      </div>

      <div>
        <label for="pageCount">Número de Páginas</label>
        <input type="number" id="pageCount" v-model="book.pageCount" required />
      </div>

      <div>
        <label for="coverType">Tipo de Capa</label>
        <select type="text" id="coverType" v-model="book.coverType" required>
          <option value="" disabled>Selecione o tipo de capa</option>
          <option value="Dura">Dura</option>
          <option value="Mole">Mole</option>
        </select>
      </div>

      <div>
        <label for="isbn">ISBN</label>
        <input type="text" id="isbn" v-model="book.isbn" required />
      </div>

      <div>
        <label for="coverImage">Imagem da Capa</label>
        <input type="file" id="coverImage" @change="handleFileChange" />
      </div>

      <div v-if="isEditing && book.coverImage">
        <p>Imagem Atual:</p>
        <img
          :src="`http://localhost:5000/${book.coverImage}`"
          alt="Capa Atual do Livro"
          style="width: 100px; height: auto;"
        />
      </div>

      <button type="submit">{{ isEditing ? "Salvar Alterações" : "Cadastrar Livro" }}</button>
    </form>

    <!-- Lista de livros recentes -->
    <div class="book-list">
      <h2>Últimos Livros Adicionados</h2>
      <div v-if="recentBooks.length > 0" class="book-items">
        <div v-for="book in recentBooks" :key="book._id" class="book-item">
          <img
            v-if="book.coverImage"
            :src="`http://localhost:5000/${book.coverImage}`"
            alt="Capa do Livro"
            class="book-cover"
          />
          <div class="book-details">
            <h3>{{ book.title }}</h3>
            <p><strong>Autor:</strong> {{ book.author }}</p>
            <p><strong>Gênero:</strong> {{ book.genre }}</p>
            <p><strong>Ano:</strong> {{ book.year }}</p>
            <p><strong>Descrição:</strong> {{ book.description }}</p>
            <p><strong>N° Páginas:</strong> {{ book.pageCount }}</p>
            <p><strong>Tipo de Capa:</strong> {{ book.coverType }}</p>
            <p><strong>ISBN:</strong> {{ book.isbn }}</p>
            <button @click="editBook(book)">Editar</button>
            <button @click="deleteBook(book._id)">Deletar</button>
          </div>
        </div>
      </div>
      <div v-else>Nenhum livro encontrado.</div>
    </div>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      book: {
        title: "",
        author: "",
        year: "",
        description: "",
        genre: "",
        pageCount: "",
        coverType: "",
        isbn: "",
        coverImage: "",
      },
      coverImageFile: null,
      recentBooks: [],
      errorMessage: null,
      successMessage: null,
      isEditing: false,
      editingBookId: null,
    };
  },
  methods: {
    handleFileChange(event) {
      this.coverImageFile = event.target.files[0];
    },
    async submitBook() {
      const formData = new FormData();
      formData.append("title", this.book.title);
      formData.append("author", this.book.author);
      formData.append("description", this.book.description);
      formData.append("year", this.book.year);
      formData.append("genre", this.book.genre);
      formData.append("pageCount", this.book.pageCount);
      formData.append("coverType", this.book.coverType);
      formData.append("isbn", this.book.isbn);
      if (this.coverImageFile) {
        formData.append("coverImage", this.coverImageFile);
      }

      try {
        if (this.isEditing) {
          // Atualiza livro existente
          await axios.put(
            `http://localhost:5000/books/${this.editingBookId}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          this.successMessage = "Livro atualizado com sucesso!";
        } else {
          // Adiciona novo livro
          await axios.post("http://localhost:5000/books", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          this.successMessage = "Livro cadastrado com sucesso!";
        }
        this.resetForm();
        this.fetchRecentBooks();
      } catch (error) {
        this.errorMessage = "Erro ao salvar o livro. Tente novamente.";
      }
    },
    async fetchRecentBooks() {
      try {
        const response = await axios.get("http://localhost:5000/books/recent");
        this.recentBooks = response.data;
      } catch (error) {
        console.error("Erro ao buscar livros recentes:", error);
      }
    },
    async deleteBook(bookId) {
      try {
        await axios.delete(`http://localhost:5000/books/${bookId}`);
        this.fetchRecentBooks();
      } catch (error) {
        console.error("Erro ao deletar livro:", error);
      }
    },
    editBook(book) {
      this.isEditing = true;
      this.editingBookId = book._id;
      this.book = { ...book };
    },
    resetForm() {
      this.book = {
        title: "",
        author: "",
        year: "",
        description: "",
        genre: "",
        pageCount: "",
        coverType: "",
        isbn: "",
        coverImage: "",
      };
      this.coverImageFile = null;
      this.isEditing = false;
      this.editingBookId = null;
    },
  },
  mounted() {
    this.fetchRecentBooks();
  },
};
</script>
  
  <style scoped>
  .book-form {
    width: 300px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  
  h2 {
    text-align: center;
  }
  
  form div {
    margin-bottom: 10px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    margin: 5px 0;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .error {
    color: red;
  }
  
  .success {
    color: green;
  }

  .book-list {
  margin-top: 30px;
}

.book-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.book-item {
  display: flex;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
}

.book-cover {
  max-width: 100px;
  max-height: 150px;
  margin-right: 20px;
  object-fit: cover;
}

.book-details h3 {
  margin: 0;
}
</style>
  