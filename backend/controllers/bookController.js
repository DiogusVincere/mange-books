const Book = require('../models/Book');

// Criar um novo livro
exports.criarLivro = async (req, res) => {
    const { titulo, autor, ano, genero, descricao } = req.body;
    try {
        const novoLivro = new Book({ titulo, autor, ano, genero, descricao });
        await novoLivro.save();
        res.status(201).json(novoLivro);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obter todos os livros
exports.listarLivros = async (req, res) => {
    try {
        const livros = await Book.find();
        res.json(livros);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obter um livro por ID
exports.obterLivro = async (req, res) => {
    try {
        const livro = await Book.findById(req.params.id);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        res.json(livro);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Atualizar um livro
exports.atualizarLivro = async (req, res) => {
    try {
        const livro = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        res.json(livro);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Deletar um livro
exports.deletarLivro = async (req, res) => {
    try {
        const livro = await Book.findByIdAndDelete(req.params.id);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        res.json({ message: 'Livro deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
