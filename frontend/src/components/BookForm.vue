<template>
  <div class="book-form"> <!-- Contêiner principal do formulário de livro -->
    <h2>{{ isEditing ? "Editar Livro" : "Adicionar Novo Livro" }}</h2> <!-- Exibe o título dependendo do estado de edição -->
    <form @submit.prevent="submitBook"> <!-- Previne o envio do formulário e chama a função submitBook -->
      
      <div>
        <label for="title">Título</label> <!-- Rótulo para o campo de título -->
        <input type="text" id="title" v-model="book.title" required /> <!-- Campo de entrada para o título do livro -->
      </div>

      <div>
        <label for="author">Autor</label> <!-- Rótulo para o campo de autor -->
        <input type="text" id="author" v-model="book.author" required /> <!-- Campo de entrada para o autor do livro -->
      </div>

      <div>
        <label for="description">Descrição</label> <!-- Rótulo para o campo de descrição -->
        <textarea
          id="description"
          v-model="book.description"
          rows="5"
          style="width: 100%; resize: none;"
          placeholder="Escreva aqui a descrição do livro"
          required
        ></textarea> <!-- Área de texto para a descrição do livro -->
      </div>

      <div>
        <label for="year">Ano</label> <!-- Rótulo para o campo de ano -->
        <input type="number" id="year" v-model="book.year" required /> <!-- Campo de entrada para o ano do livro -->
      </div>

      <div>
        <label for="genre">Gênero</label> <!-- Rótulo para o campo de gênero -->
        <select id="genre" v-model="book.genre" required> <!-- Lista suspensa para selecionar o gênero -->
          <option value="" disabled>Selecione um gênero</option> <!-- Opção desabilitada como instrução -->
          <option value="Fantasia">Fantasia</option> <!-- Opção para gênero Fantasia -->
          <option value="Terror">Terror</option> <!-- Opção para gênero Terror -->
          <option value="Drama">Drama</option> <!-- Opção para gênero Drama -->
          <option value="Suspense">Suspense</option> <!-- Opção para gênero Suspense -->
          <option value="Ação">Ação</option> <!-- Opção para gênero Ação -->
          <option value="Ficção">Ficção</option> <!-- Opção para gênero Ficção -->
        </select>
      </div>

      <div>
        <label for="pageCount">Número de Páginas</label> <!-- Rótulo para o campo de número de páginas -->
        <input type="number" id="pageCount" v-model="book.pageCount" required /> <!-- Campo de entrada para o número de páginas -->
      </div>

      <div>
        <label for="coverType">Tipo de Capa</label> <!-- Rótulo para o campo de tipo de capa -->
        <select type="text" id="coverType" v-model="book.coverType" required> <!-- Lista suspensa para selecionar tipo de capa -->
          <option value="" disabled>Selecione o tipo de capa</option> <!-- Opção desabilitada como instrução -->
          <option value="Dura">Dura</option> <!-- Opção para capa dura -->
          <option value="Mole">Mole</option> <!-- Opção para capa mole -->
        </select>
      </div>

      <div>
        <label for="isbn">ISBN</label> <!-- Rótulo para o campo de ISBN -->
        <input type="text" id="isbn" v-model="book.isbn" required /> <!-- Campo de entrada para o ISBN do livro -->
      </div>

      <div>
        <label for="coverImage">Imagem da Capa</label> <!-- Rótulo para o campo de imagem da capa -->
        <input type="file" id="coverImage" @change="handleFileChange" /> <!-- Campo de entrada para carregar a imagem da capa -->
      </div>

      <div v-if="isEditing && book.coverImage"> <!-- Condição para exibir a imagem atual se estiver editando e houver imagem -->
        <p>Imagem Atual:</p>
        <img
          :src="`http://localhost:5000/${book.coverImage}`"
          alt="Capa Atual do Livro"
          style="width: 100px; height: auto;"
        /> <!-- Exibe a imagem atual da capa -->
      </div>

      <button type="submit">{{ isEditing ? "Salvar Alterações" : "Cadastrar Livro" }}</button> <!-- Botão para submeter o formulário, muda conforme edição ou novo livro -->
    </form>

    <!-- Lista de livros recentes -->
    <div class="book-list">
      <h2>Últimos Livros Adicionados</h2> <!-- Título para a lista de livros recentes -->
      <div v-if="recentBooks.length > 0" class="book-items"> <!-- Exibe a lista de livros se houver livros recentes -->
        <div v-for="book in recentBooks" :key="book._id" class="book-item"> <!-- Itera sobre os livros recentes -->
          <img
            v-if="book.coverImage"
            :src="`http://localhost:5000/${book.coverImage}`"
            alt="Capa do Livro"
            class="book-cover"
          /> <!-- Exibe a imagem da capa se existir -->
          <div class="book-details">
            <h3>{{ book.title }}</h3> <!-- Exibe o título do livro -->
            <p><strong>Autor:</strong> {{ book.author }}</p> <!-- Exibe o autor do livro -->
            <p><strong>Gênero:</strong> {{ book.genre }}</p> <!-- Exibe o gênero do livro -->
            <p><strong>Ano:</strong> {{ book.year }}</p> <!-- Exibe o ano de publicação -->
            <p><strong>Descrição:</strong> {{ book.description }}</p> <!-- Exibe a descrição do livro -->
            <p><strong>N° Páginas:</strong> {{ book.pageCount }}</p> <!-- Exibe o número de páginas -->
            <p><strong>Tipo de Capa:</strong> {{ book.coverType }}</p> <!-- Exibe o tipo de capa -->
            <p><strong>ISBN:</strong> {{ book.isbn }}</p> <!-- Exibe o ISBN -->
            <button @click="editBook(book)">Editar</button> <!-- Botão para editar o livro -->
            <button @click="deleteBook(book._id)">Deletar</button> <!-- Botão para deletar o livro -->
          </div>
        </div>
      </div>
      <div v-else>Nenhum livro encontrado.</div> <!-- Exibe mensagem caso não haja livros -->
    </div>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div> <!-- Exibe mensagem de erro se houver -->
    <div v-if="successMessage" class="success">{{ successMessage }}</div> <!-- Exibe mensagem de sucesso se houver -->
  </div>
</template>

<script>
import axios from "axios"; <!-- Importa o axios para fazer requisições HTTP -->

export default {
  data() {
    return {
      book: { <!-- Dados do livro -->
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
      coverImageFile: null, <!-- Arquivo de imagem da capa -->
      recentBooks: [], <!-- Lista de livros recentes -->
      errorMessage: null, <!-- Mensagem de erro -->
      successMessage: null, <!-- Mensagem de sucesso -->
      isEditing: false, <!-- Indicador se está editando um livro -->
      editingBookId: null, <!-- ID do livro sendo editado -->
    };
  },
  methods: {
    handleFileChange(event) {
      this.coverImageFile = event.target.files[0]; <!-- Atualiza o arquivo da capa -->
    },
    async submitBook() { <!-- Função para submeter o livro -->
      const formData = new FormData(); <!-- Cria um FormData para enviar o livro -->
      formData.append("title", this.book.title); <!-- Adiciona o título -->
      formData.append("author", this.book.author); <!-- Adiciona o autor -->
      formData.append("description", this.book.description); <!-- Adiciona a descrição -->
      formData.append("year", this.book.year); <!-- Adiciona o ano -->
      formData.append("genre", this.book.genre); <!-- Adiciona o gênero -->
      formData.append("pageCount", this.book.pageCount); <!-- Adiciona o número de páginas -->
      formData.append("coverType", this.book.coverType); <!-- Adiciona o tipo de capa -->
      formData.append("isbn", this.book.isbn); <!-- Adiciona o ISBN -->
      if (this.coverImageFile) {
        formData.append("coverImage", this.coverImageFile); <!-- Adiciona a imagem da capa, se presente -->
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
          this.successMessage = "Livro atualizado com sucesso!"; <!-- Exibe mensagem de sucesso ao atualizar -->
        } else {
          // Adiciona novo livro
          await axios.post("http://localhost:5000/books", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          this.successMessage = "Livro cadastrado com sucesso!"; <!-- Exibe mensagem de sucesso ao cadastrar -->
        }
        this.resetForm(); <!-- Reseta o formulário -->
        this.fetchRecentBooks(); <!-- Atualiza a lista de livros recentes -->
      } catch (error) {
        this.errorMessage = "Erro ao salvar o livro. Tente novamente."; <!-- Exibe mensagem de erro -->
      }
    },
    async fetchRecentBooks() { <!-- Função para buscar livros recentes -->
      try {
        const response = await axios.get("http://localhost:5000/books/recent");
        this.recentBooks = response.data; <!-- Atualiza a lista de livros recentes -->
      } catch (error) {
        console.error("Erro ao buscar livros recentes:", error); <!-- Log de erro -->
      }
    },
    async deleteBook(bookId) { <!-- Função para deletar um livro -->
      try {
        await axios.delete(`http://localhost:5000/books/${bookId}`);
        this.fetchRecentBooks(); <!-- Atualiza a lista de livros após deleção -->
      } catch (error) {
        console.error("Erro ao deletar livro:", error); <!-- Log de erro -->
      }
    },
    editBook(book) { <!-- Função para editar um livro -->
      this.isEditing = true; <!-- Marca como edição -->
      this.editingBookId = book._id; <!-- Armazena o ID do livro sendo editado -->
      this.book = { ...book }; <!-- Preenche o formulário com os dados do livro -->
    },
    resetForm() { <!-- Função para resetar o formulário -->
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
      this.coverImageFile = null; <!-- Limpa a imagem da capa -->
      this.isEditing = false; <!-- Marca como não edição -->
      this.editingBookId = null; <!-- Limpa o ID do livro sendo editado -->
    },
  },
  mounted() {
    this.fetchRecentBooks(); <!-- Busca os livros recentes quando o componente é montado -->
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
  