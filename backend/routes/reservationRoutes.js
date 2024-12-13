const express = require('express'); // Importa o módulo Express, que facilita a criação do servidor e das rotas
const router = express.Router(); // Cria um roteador do Express para gerenciar as rotas de reservas
const reservationController = require('../controllers/reservationController'); // Importa o controller de reservas, que contém as funções para tratar as reservas
const { authMiddleware } = require('../middleware/auth'); // Importa o middleware de autenticação, que verifica se o usuário está autenticado

// Rotas protegidas por autenticação
router.post('/reserve', authMiddleware, reservationController.reserveBook); // Rota POST para reservar um livro, com verificação de autenticação
router.post('/loan', authMiddleware, reservationController.loanBook); // Rota POST para emprestar um livro, com verificação de autenticação
router.post('/return', authMiddleware, reservationController.returnBook); // Rota POST para devolver um livro, com verificação de autenticação
router.get('/history', authMiddleware, reservationController.getLoanHistory); // Rota GET para obter o histórico de empréstimos, com verificação de autenticação
router.get('/', authMiddleware, reservationController.getReservations); // Rota GET para obter todas as reservas, com verificação de autenticação

module.exports = router; // Exporta o roteador para que possa ser usado em outros arquivos
