const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authMiddleware } = require('../middleware/auth');

// Rotas protegidas por autenticação
router.post('/reserve', authMiddleware, reservationController.reserveBook);
router.post('/loan', authMiddleware, reservationController.loanBook);
router.post('/return', authMiddleware, reservationController.returnBook);
router.get('/history', authMiddleware, reservationController.getLoanHistory);
router.get('/', authMiddleware, reservationController.getReservations);

module.exports = router;
