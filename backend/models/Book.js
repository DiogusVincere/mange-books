const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true},
    year: { type: Number, required: true },
    genre: { 
        type: String, 
        required: true, 
        enum: ['Fantasia', 'Terror', 'Drama', 'Suspense', 'Ação', 'Ficção'], // Gêneros predefinidos
        message: '{VALUE} não é um gênero válido' // Mensagem de erro opcional
    },
    pageCount: { type: Number, required: true },
    coverType: {
        type: String,
        required: true,
        enum: ['Dura', 'Mole'],
        message: '{VALUE} não é um tipo de capa válido'
     },
    isbn: { type: String, required: true, unique: true },
    coverImage: { type: String } // Armazena o caminho da imagem de capa
});

module.exports = mongoose.model('Book', bookSchema);
