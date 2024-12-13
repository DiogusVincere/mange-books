const Review = require('../models/Review'); // Importa o modelo de avaliações.
const Book = require('../models/Book'); // Importa o modelo de livros.
const User = require('../models/user'); // Importa o modelo de usuários.

// Criar uma avaliação
exports.createReview = async (req, res) => {
    const { bookId, rating, comment } = req.body; // Desestrutura as informações da requisição.
    const userId = req.userId; // Obtém o ID do usuário autenticado a partir do middleware.

    try {
        // Verificar se o livro existe no banco de dados.
        const book = await Book.findById(bookId);
        if (!book) { // Se o livro não for encontrado, retorna um erro 404.
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        // Obter dados do usuário autenticado.
        const user = await User.findById(userId);
        if (!user) { // Se o usuário não for encontrado, retorna um erro 404.
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Criar uma nova avaliação com as informações fornecidas.
        const review = new Review({
            bookId, // ID do livro relacionado à avaliação.
            userId, // ID do usuário que fez a avaliação.
            userName: user.fullName, // Nome completo do usuário para exibição.
            userProfileImage: user.profileImage || 'default.jpg', // Define uma imagem padrão caso o usuário não tenha uma.
            rating, // Nota dada pelo usuário.
            comment // Comentário do usuário sobre o livro.
        });

        await review.save(); // Salva a avaliação no banco de dados.
        res.status(201).json({ message: 'Avaliação criada com sucesso', review }); // Retorna sucesso com os detalhes da avaliação.
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar avaliação', error }); // Retorna erro caso ocorra falha no processo.
    }
};

// Obter todas as avaliações de um livro
exports.getReviewsByBook = async (req, res) => {
    const { bookId } = req.params; // Obtém o ID do livro a partir dos parâmetros da URL.

    try {
        // Verificar se o livro existe no banco de dados.
        const book = await Book.findById(bookId);
        if (!book) { // Retorna erro 404 caso o livro não seja encontrado.
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        // Buscar todas as avaliações relacionadas ao livro.
        const reviews = await Review.find({ bookId }).populate('userId', 'fullName profileImage'); // Popula os campos do usuário na avaliação.

        res.status(200).json(reviews); // Retorna as avaliações encontradas.
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar avaliações', error }); // Retorna erro caso ocorra falha no processo.
    }
};

// Excluir uma avaliação
exports.deleteReview = async (req, res) => {
    const { reviewId } = req.params; // Obtém o ID da avaliação a partir dos parâmetros da URL.

    try {
        // Verificar se a avaliação existe no banco de dados.
        const review = await Review.findById(reviewId);
        if (!review) { // Retorna erro 404 caso a avaliação não seja encontrada.
            return res.status(404).json({ message: 'Avaliação não encontrada' });
        }

        // Verificar se o usuário autenticado é o autor da avaliação ou um administrador.
        if (review.userId.toString() !== req.userId.toString()) { // Compara os IDs como strings para evitar inconsistências.
            return res.status(403).json({ message: 'Você não tem permissão para excluir essa avaliação' }); // Retorna erro de permissão.
        }

        await review.remove(); // Remove a avaliação do banco de dados.
        res.status(200).json({ message: 'Avaliação excluída com sucesso' }); // Retorna sucesso após exclusão.
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir avaliação', error }); // Retorna erro caso ocorra falha no processo.
    }
};