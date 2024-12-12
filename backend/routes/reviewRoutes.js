const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Middleware de autenticação (exemplo)
const { authMiddleware } = require('../middleware/auth');

// Criar avaliação (necessário estar logado)
router.post('/create', authMiddleware, reviewController.createReview);

// Obter avaliações de um livro
router.get('/:bookId', reviewController.getReviewsByBook);

// Excluir avaliação (necessário ser o autor da avaliação ou admin)
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;
