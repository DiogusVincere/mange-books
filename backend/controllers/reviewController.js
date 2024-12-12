const Review = require('../models/Review');
const Book = require('../models/Book'); // Modelo de Livro
const User = require('../models/user'); // Modelo de Usuário

// Criar uma avaliação
exports.createReview = async (req, res) => {
    const { bookId, rating, comment } = req.body;
    const userId = req.userId; // ID do usuário autenticado (obtido via middleware de autenticação)

    try {
        // Verificar se o livro existe
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        // Obter dados do usuário
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Criar a nova avaliação
        const review = new Review({
            bookId,
            userId,
            userName: user.fullName,
            userProfileImage: user.profileImage || 'default.jpg', // Imagem padrão caso não exista
            rating,
            comment
        });

        await review.save();
        res.status(201).json({ message: 'Avaliação criada com sucesso', review });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar avaliação', error });
    }
};

// Obter todas as avaliações de um livro
exports.getReviewsByBook = async (req, res) => {
    const { bookId } = req.params;

    try {
        // Verificar se o livro existe
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        // Buscar todas as avaliações para o livro
        const reviews = await Review.find({ bookId }).populate('userId', 'fullName profileImage');

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar avaliações', error });
    }
};

// Excluir uma avaliação
exports.deleteReview = async (req, res) => {
    const { reviewId } = req.params;

    try {
        // Verificar se a avaliação existe
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Avaliação não encontrada' });
        }

        // Verificar se o usuário é o autor da avaliação ou um administrador
        if (review.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Você não tem permissão para excluir essa avaliação' });
        }

        await review.remove();
        res.status(200).json({ message: 'Avaliação excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir avaliação', error });
    }
};
