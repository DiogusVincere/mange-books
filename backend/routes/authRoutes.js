const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');
const { authMiddleware, comPapel, somenteBibliotecario } = require('../middleware/auth');

// Abertas
router.post('/register', c.register);
router.post('/login', c.login);

// Do próprio usuário logado
router.get('/me', authMiddleware, c.getUserProfile);
router.put('/me/senha', authMiddleware, c.trocarSenha);

// Gestão de usuários: lista e exclusão só para bibliotecários; ver/editar vale
// para o bibliotecário ou para o próprio usuário (a checagem está no controller).
router.get('/', authMiddleware, somenteBibliotecario, c.getAllUsers);
router.get('/:id', authMiddleware, comPapel, c.getUserById);
router.put('/:id', authMiddleware, comPapel, c.updateUser);
router.delete('/:id', authMiddleware, somenteBibliotecario, c.deleteUser);

module.exports = router;
