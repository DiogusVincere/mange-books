const express = require('express'); // Importamos o Express
const Book = require('../models/Book'); // Importamos o modelo Book
const router = express.Router(); // Criamos o roteador
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define o diretório onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Gera um nome único para o arquivo
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // Limite de 2MB
});

// Rota POST para adicionar um novo livro
router.post('/', upload.single('coverImage'), async (req, res) => {
    console.log('Arquivo recebido:', req.file); // Log do arquivo recebido
    console.log('Corpo da requisição:', req.body); // Log do corpo da requisição com os dados do livro

    try {
        const { title, author, description, year, genre, pageCount, coverType, isbn } = req.body;

        // Cria um novo livro com os dados e o caminho da imagem (se houver)
        const newBook = new Book({
            title,
            author,
            description,
            year,
            genre,
            pageCount,
            coverType,
            isbn,
            coverImage: req.file ? req.file.path : null // Atribui o caminho do arquivo, se o arquivo for enviado
        });

        await newBook.save();
        console.log('Livro criado com sucesso:', newBook); // Log do livro criado
        res.status(201).json(newBook);
    } catch (error) {
        console.error('Erro ao salvar livro:', error); // Log de erro
        res.status(500).json({ message: error.message });
    }
});

// Rota GET para obter todos os livros
router.get('/', async (req, res) => {
    try {
        const books = await Book.find(); // Busca todos os livros
        console.log('Livros encontrados:', books); // Log dos livros encontrados
        res.status(200).json(books); // Retorna a lista de livros
    } catch (error) {
        console.error('Erro ao buscar livros:', error); // Log de erro
        res.status(500).json({ message: 'Erro ao buscar livros', error });
    }
});

// Rota GET para obter os dois últimos livros adicionados
router.get('/recent', async (req, res) => {
    try {
        const recentBooks = await Book.find().sort({ _id: -1 }).limit(2);
        res.status(200).json(recentBooks);
    } catch (error) {
        console.error('Erro ao buscar livros recentes:', error);
        res.status(500).json({ message: 'Erro ao buscar livros recentes', error });
    }
});

// Rota GET para obter um livro pelo ID
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id); // Encontra o livro pelo ID
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }
        res.status(200).json(book); // Retorna o livro encontrado
    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ message: 'Erro ao buscar livro', error });
    }
});

// Rota PUT para atualizar um livro pelo ID
router.put('/:id', upload.single('coverImage'), async (req, res) => {
    try {
        // Extração dos campos enviados no corpo da requisição
        const { 
            title, 
            author, 
            description, 
            year, 
            genre, 
            pageCount, 
            coverType, 
            isbn 
        } = req.body;

        // Buscar o livro pelo ID
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        // Atualização do campo coverImage, caso um novo arquivo seja enviado
        if (req.file) {
            // Deletar a imagem antiga, se existir
            if (book.coverImage) {
                fs.unlink(book.coverImage, (err) => {
                    if (err) console.error('Erro ao deletar a imagem antiga:', err);
                });
            }
            book.coverImage = req.file.path; // Atualizar o caminho da nova imagem
        }

        // Atualizar os outros campos do modelo
        book.title = title || book.title;
        book.author = author || book.author;
        book.description = description || book.description;
        book.year = year || book.year;
        book.genre = genre || book.genre;
        book.pageCount = pageCount || book.pageCount;
        book.coverType = coverType || book.coverType;
        book.isbn = isbn || book.isbn;

        // Salvar as alterações no banco de dados
        const updatedBook = await book.save();

        res.status(200).json(updatedBook); // Retorna o livro atualizado
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ message: 'Erro ao atualizar livro', error });
    }
});

// Rota DELETE para excluir um livro pelo ID
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book && book.coverImage) {
            fs.unlink(book.coverImage, (err) => {
                if (err) console.error('Erro ao deletar a imagem:', err);
            });
        }
        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Livro deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar livro', error });
    }
});

// Exporta o roteador para ser usado em outros arquivos
module.exports = router;
