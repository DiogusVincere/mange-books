const express = require('express'); // Importa o módulo express, que facilita a criação e gestão de rotas.
const Book = require('../models/Book'); // Importa o modelo Book, que representa a estrutura de dados de um livro no banco de dados.
const router = express.Router(); // Cria um roteador para definir as rotas do aplicativo.
const multer = require('multer'); // Importa o multer para lidar com upload de arquivos.
const fs = require('fs'); // Importa o módulo 'fs' para manipulação de arquivos no sistema de arquivos.
const path = require('path'); // Importa o módulo 'path' para trabalhar com caminhos de arquivos no sistema.

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define o diretório onde os arquivos serão armazenados no servidor.
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Gera um nome único para o arquivo, incluindo a data e hora atual.
    }
});
const upload = multer({
    storage, // Usa a configuração de armazenamento definida acima.
    limits: { fileSize: 2 * 1024 * 1024 } // Define o limite de tamanho de arquivo para 2MB.
});

// Rota POST para adicionar um novo livro
router.post('/', upload.single('coverImage'), async (req, res) => {
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
            coverImage: req.file ? req.file.path : null // Atribui o caminho do arquivo de imagem, caso tenha sido enviado.
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
        console.log('Livros encontrados:', books); // Exibe no console a lista de livros encontrados.
        res.status(200).json(books); // Retorna os livros encontrados como resposta.
    } catch (error) {
        console.error('Erro ao buscar livros:', error); // Exibe no console um erro caso ocorra durante a busca.
        res.status(500).json({ message: 'Erro ao buscar livros', error }); // Retorna um erro 500 caso falhe ao buscar os livros.
    }
});

// Rota GET para obter os dois últimos livros adicionados
router.get('/recent', async (req, res) => {
    try {
        const recentBooks = await Book.find().sort({ _id: -1 }).limit(2); // Busca os dois livros mais recentes, ordenados pelo ID.
        res.status(200).json(recentBooks); // Retorna os livros recentes encontrados como resposta.
    } catch (error) {
        console.error('Erro ao buscar livros recentes:', error); // Exibe no console um erro caso ocorra durante a busca.
        res.status(500).json({ message: 'Erro ao buscar livros recentes', error }); // Retorna um erro 500 caso falhe ao buscar os livros recentes.
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
        res.status(500).json({ message: 'Erro ao buscar livro', error }); // Retorna um erro 500 caso falhe ao buscar o livro.
    }
});

// Rota PUT para atualizar um livro pelo ID
router.put('/:id', upload.single('coverImage'), async (req, res) => {
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
            // Deleta a imagem anterior, se existir
            if (book.coverImage) {
                fs.unlink(book.coverImage, (err) => {
                    if (err) console.error('Erro ao deletar a imagem antiga:', err); // Exibe erro caso falhe ao deletar a imagem.
                });
            }
            book.coverImage = req.file.path; // Atualiza o caminho da imagem com o novo arquivo.
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
        res.status(500).json({ message: 'Erro ao atualizar livro', error }); // Retorna um erro 500 caso falhe ao atualizar o livro.
    }
});

// Rota DELETE para excluir um livro pelo ID
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book && book.coverImage) {
            fs.unlink(book.coverImage, (err) => { // Deleta a imagem do livro, se existir
                if (err) console.error('Erro ao deletar a imagem:', err); // Exibe erro caso falhe ao deletar a imagem.
            });
        }
        await Book.findByIdAndDelete(req.params.id); // Deleta o livro pelo ID
        res.status(200).json({ message: 'Livro deletado com sucesso' }); // Retorna sucesso após deletar o livro.
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar livro', error }); // Retorna um erro 500 caso falhe ao deletar o livro.
    }
});

// Exporta o roteador para ser utilizado em outros arquivos da aplicação
module.exports = router; 