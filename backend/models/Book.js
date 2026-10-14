const mongoose = require('mongoose');

const GENEROS = ['Fantasia', 'Terror', 'Drama', 'Suspense', 'Ação', 'Ficção'];
const TIPOS_CAPA = ['Dura', 'Mole'];

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true, enum: GENEROS },
    pageCount: { type: Number, required: true, min: 1 },
    coverType: { type: String, required: true, enum: TIPOS_CAPA },
    isbn: { type: String, required: true, unique: true },
    // Caminho relativo ("uploads/arquivo.jpg", servido em /uploads) ou URL completa.
    coverImage: { type: String },
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
Book.GENEROS = GENEROS;
Book.TIPOS_CAPA = TIPOS_CAPA;
module.exports = Book;
