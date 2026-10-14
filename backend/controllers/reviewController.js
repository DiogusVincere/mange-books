const mongoose = require('mongoose');
const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/user');

const formatar = (r) => ({
    _id: r._id,
    bookId: r.bookId,
    userId: r.userId,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment || '',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
});

// Criar ou atualizar a avaliação do usuário logado para um livro
exports.createReview = async (req, res) => {
    const { bookId, comment } = req.body;
    const rating = Number(req.body.rating);
    if (!mongoose.isValidObjectId(bookId)) {
        return res.status(400).json({ message: 'Livro inválido' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'A nota deve ser um número inteiro de 1 a 5' });
    }
    const texto = String(comment || '').trim();
    if (texto.length > 1000) {
        return res.status(400).json({ message: 'O comentário deve ter até 1000 caracteres' });
    }
    try {
        const [livro, usuario] = await Promise.all([Book.findById(bookId), User.findById(req.userId)]);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

        const existente = await Review.findOne({ bookId, userId: req.userId });
        if (existente) {
            existente.rating = rating;
            existente.comment = texto;
            existente.userName = usuario.fullName;
            await existente.save();
            return res.status(200).json({ message: 'Avaliação atualizada', review: formatar(existente) });
        }
        const review = await Review.create({ bookId, userId: req.userId, userName: usuario.fullName, rating, comment: texto });
        res.status(201).json({ message: 'Avaliação enviada', review: formatar(review) });
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        res.status(500).json({ message: 'Erro ao salvar avaliação' });
    }
};

// Avaliações de um livro, mais recentes primeiro
exports.getReviewsByBook = async (req, res) => {
    const { bookId } = req.params;
    if (!mongoose.isValidObjectId(bookId)) {
        return res.status(400).json({ message: 'Livro inválido' });
    }
    try {
        const reviews = await Review.find({ bookId }).sort({ createdAt: -1 });
        res.status(200).json(reviews.map(formatar));
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({ message: 'Erro ao buscar avaliações' });
    }
};

// Excluir: o autor ou um bibliotecário
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Avaliação não encontrada' });
        const ehAutor = String(review.userId) === String(req.userId);
        if (!ehAutor && req.papel !== 'bibliotecario') {
            return res.status(403).json({ message: 'Você só pode excluir a sua própria avaliação' });
        }
        await review.deleteOne();
        res.status(200).json({ message: 'Avaliação excluída' });
    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        res.status(500).json({ message: 'Erro ao excluir avaliação' });
    }
};
