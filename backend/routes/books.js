const express = require('express'); // Importa o módulo express, que facilita a criação e gestão de rotas.
const Book = require('../models/Book'); // Importa o modelo Book, que representa a estrutura de dados de um livro no banco de dados.
const router = express.Router(); // Cria um roteador para definir as rotas do aplicativo.
const multer = require('multer'); // Importa o multer para lidar com upload de arquivos.
const fs = require('fs'); // Importa o módulo 'fs' para manipulação de arquivos no sistema de arquivos.
const path = require('path'); // Importa o módulo 'path' para trabalhar com caminhos de arquivos no sistema.
const { authMiddleware } = require('../middleware/auth'); // Exige login para criar, alterar e excluir livros.

// Pasta de uploads sempre relativa a este arquivo, não ao diretório de onde o node foi chamado.
const PASTA_UPLOADS = path.join(__dirname, '..', 'uploads');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PASTA_UPLOADS); // Define o diretório onde os arquivos serão armazenados no servidor.
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Gera um nome único para o arquivo, incluindo a data e hora atual.
    }
});
const upload = multer({
    storage, // Usa a configuração de armazenamento definida acima.
    limits: { fileSize: 2 * 1024 * 1024 } // Define o limite de tamanho de arquivo para 2MB.
});

// Caminho gravado no banco: sempre com barra normal ("uploads/arquivo.jpg"), mesmo no Windows.
const caminhoDaCapa = (file) => `uploads/${file.filename}`;

// Apaga a capa do disco quando é arquivo local. Capas por URL (como as do seed) ficam.
const apagarCapa = (coverImage) => {
    if (!coverImage || /^https?:\/\//i.test(coverImage)) return;
    fs.unlink(path.join(__dirname, '..', coverImage), (err) => {
        if (err && err.code !== 'ENOENT') console.error('Erro ao apagar a capa:', err);
    });
};

// Rota POST para adicionar um novo livro
router.post('/', authMiddleware, upload.single('coverImage'), async (req, res) => {
    console.log('Arquivo recebido:', req.file); // Exibe no console o arquivo recebido pelo servidor.
    console.log('Corpo da requisição:', req.body); // Exibe no console o corpo da requisição com os dados do livro.

    try {
        const { title, author, description, year, genre, pageCount, coverType, isbn } = req.body;

        // Cria um novo livro com os dados recebidos e o caminho da imagem (se fornecido)
        const newBook = new Book({
            title,
            author,
            description,
            year,
            genre,
            pageCount,
            coverType,
            isbn,
            coverImage: req.file ? caminhoDaCapa(req.file) : null // Caminho relativo da capa, se enviada.
        });

        await newBook.save(); // Salva o novo livro no banco de dados.
        console.log('Livro criado com sucesso:', newBook); // Exibe no console o livro criado com sucesso.
        res.status(201).json(newBook); // Retorna o livro criado como resposta.
    } catch (error) {
        console.error('Erro ao salvar livro:', error); // Exibe no console um erro caso ocorra durante o processo de criação.
        res.status(500).json({ message: error.message }); // Retorna um erro 500 caso falhe ao salvar o livro.
    }
});

// Rota GET para obter todos os livros
router.get('/', async (req, res) => {
    try {
        const books = await Book.find(); // Busca todos os livros no banco de dados.
        res.status(200).json(books); // Retorna os livros encontrados como resposta.
    } catch (error) {
        console.error('Erro ao buscar livros:', error); // Exibe no console um erro caso ocorra durante a busca.
        res.status(500).json({ message: 'Erro ao buscar livros' }); // Retorna um erro 500 caso falhe ao buscar os livros.
    }
});

// Rota GET para obter os dois últimos livros adicionados
router.get('/recent', async (req, res) => {
    try {
        const recentBooks = await Book.find().sort({ _id: -1 }).limit(2); // Busca os dois livros mais recentes, ordenados pelo ID.
        res.status(200).json(recentBooks); // Retorna os livros recentes encontrados como resposta.
    } catch (error) {
        console.error('Erro ao buscar livros recentes:', error); // Exibe no console um erro caso ocorra durante a busca.
        res.status(500).json({ message: 'Erro ao buscar livros recentes' }); // Retorna um erro 500 caso falhe ao buscar os livros recentes.
    }
});

// Rota GET para buscar livros por título ou autor (?q=texto). Precisa vir antes de '/:id'.
router.get('/search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) {
        return res.status(200).json({ books: [] });
    }
    try {
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // Texto literal, sem metacaracteres
        const books = await Book.find({ $or: [{ title: regex }, { author: regex }] }).limit(10);
        res.status(200).json({ books });
    } catch (error) {
        console.error('Erro na busca de livros:', error);
        res.status(500).json({ message: 'Erro na busca de livros' });
    }
});

// Rota GET para obter um livro pelo ID
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id); // Encontra o livro pelo ID fornecido na URL.
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' }); // Retorna um erro 404 caso o livro não seja encontrado.
        }
        res.status(200).json(book); // Retorna o livro encontrado como resposta.
    } catch (error) {
        console.error('Erro ao buscar livro:', error); // Exibe no console um erro caso ocorra durante a busca.
        res.status(500).json({ message: 'Erro ao buscar livro' }); // Retorna um erro 500 caso falhe ao buscar o livro.
    }
});

// Rota PUT para atualizar um livro pelo ID
router.put('/:id', authMiddleware, upload.single('coverImage'), async (req, res) => {
    try {
        // Extração dos dados enviados no corpo da requisição
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
            return res.status(404).json({ message: 'Livro não encontrado' }); // Retorna erro caso o livro não seja encontrado.
        }

        // Atualiza o campo coverImage se um novo arquivo for enviado
        if (req.file) {
            apagarCapa(book.coverImage); // Remove a imagem anterior, se for arquivo local
            book.coverImage = caminhoDaCapa(req.file); // Atualiza o caminho da imagem com o novo arquivo.
        }

        // Atualiza os outros campos do livro com os dados fornecidos ou mantém os valores antigos
        book.title = title || book.title;
        book.author = author || book.author;
        book.description = description || book.description;
        book.year = year || book.year;
        book.genre = genre || book.genre;
        book.pageCount = pageCount || book.pageCount;
        book.coverType = coverType || book.coverType;
        book.isbn = isbn || book.isbn;

        // Salva as alterações no banco de dados
        const updatedBook = await book.save();

        res.status(200).json(updatedBook); // Retorna o livro atualizado como resposta.
    } catch (error) {
        console.error('Erro ao atualizar livro:', error); // Exibe no console um erro caso ocorra durante a atualização.
        res.status(500).json({ message: 'Erro ao atualizar livro' }); // Retorna um erro 500 caso falhe ao atualizar o livro.
    }
});

// Rota DELETE para excluir um livro pelo ID
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }
        apagarCapa(book.coverImage); // Deleta a imagem do livro, se for arquivo local
        await Book.findByIdAndDelete(req.params.id); // Deleta o livro pelo ID
        res.status(200).json({ message: 'Livro deletado com sucesso' }); // Retorna sucesso após deletar o livro.
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar livro' }); // Retorna um erro 500 caso falhe ao deletar o livro.
    }
});

// Exporta o roteador para ser utilizado em outros arquivos da aplicação
module.exports = router; 