const mongoose = require('mongoose'); // Importa o mongoose para manipulação de modelos e esquemas do MongoDB.

// Define o esquema do livro com os campos e suas validações
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Campo obrigatório para o título do livro, do tipo String.
    author: { type: String, required: true }, // Campo obrigatório para o autor do livro, do tipo String.
    description: { type: String, required: true }, // Campo obrigatório para a descrição do livro, do tipo String.
    year: { type: Number, required: true }, // Campo obrigatório para o ano de publicação, do tipo Number.
    genre: { 
        type: String, 
        required: true, // Campo obrigatório para o gênero do livro.
        enum: ['Fantasia', 'Terror', 'Drama', 'Suspense', 'Ação', 'Ficção'], // Valores válidos pré-definidos para o gênero.
        message: '{VALUE} não é um gênero válido' // Mensagem de erro caso o valor não esteja nos gêneros permitidos.
    },
    pageCount: { type: Number, required: true }, // Campo obrigatório para o número de páginas, do tipo Number.
    coverType: {
        type: String,
        required: true, // Campo obrigatório para o tipo de capa.
        enum: ['Dura', 'Mole'], // Valores válidos para o tipo de capa.
        message: '{VALUE} não é um tipo de capa válido' // Mensagem de erro caso o valor não seja válido.
    },
    isbn: { type: String, required: true, unique: true }, // Campo obrigatório e único para o ISBN do livro, do tipo String.
    coverImage: { type: String } // Campo opcional para armazenar o caminho da imagem de capa do livro.
});

// Exporta o modelo baseado no esquema para ser usado em outras partes da aplicação.
module.exports = mongoose.model('Book', bookSchema);
