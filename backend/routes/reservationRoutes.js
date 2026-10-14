const express = require('express');
const router = express.Router();
const c = require('../controllers/reservationController');
const { authMiddleware, comPapel, somenteBibliotecario } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/reserve', c.reserveBook);
router.post('/cancel', comPapel, c.cancelReservation);
router.get('/history', c.getLoanHistory);
router.get('/todas', somenteBibliotecario, c.getAllReservations);
router.post('/loan', somenteBibliotecario, c.loanBook);
router.post('/return', somenteBibliotecario, c.returnBook);
router.get('/', c.getReservations);

module.exports = router;
