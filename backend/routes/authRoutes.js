const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Abertas: cadastro e login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protegidas: perfil do logado e CRUD de usuários
router.get('/me', authMiddleware, authController.getUserProfile);
router.get('/', authMiddleware, authController.getAllUsers);
router.get('/:id', authMiddleware, authController.getUserById);
router.put('/:id', authMiddleware, authController.updateUser);
router.delete('/:id', authMiddleware, authController.deleteUser);

module.exports = router;
