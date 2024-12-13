const express = require('express'); // Importa o módulo express para criar o servidor e gerenciar as rotas.
const router = express.Router(); // Cria um roteador para definir as rotas de forma modular.
const authController = require('../controllers/authController'); // Importa o controlador de autenticação que contém as funções de registro, login, etc.
const { authMiddleware } = require('../middleware/auth'); // Importa o middleware de autenticação para proteger certas rotas.

// Rotas de autenticação
router.post('/register', authController.register); // Define a rota POST para o registro de um novo usuário, chamando a função 'register' do controlador de autenticação.
router.post('/login', authController.login); // Define a rota POST para o login de um usuário, chamando a função 'login' do controlador de autenticação.
router.get('/me', authMiddleware, authController.getUserProfile); // Define a rota GET para obter o perfil do usuário logado, com o middleware de autenticação para verificar a sessão do usuário.

// Rotas de CRUD para gerenciamento de usuários
router.get('/', authController.getAllUsers); // Define a rota GET para obter todos os usuários, chamando a função 'getAllUsers' do controlador de autenticação.
router.get('/:id', authController.getUserById); // Define a rota GET para obter um usuário específico pelo ID, chamando a função 'getUserById' do controlador de autenticação.
router.put('/:id', authController.updateUser); // Define a rota PUT para atualizar os dados de um usuário específico, chamando a função 'updateUser' do controlador de autenticação.
router.delete('/:id', authController.deleteUser); // Define a rota DELETE para excluir um usuário específico pelo ID, chamando a função 'deleteUser' do controlador de autenticação.

module.exports = router; // Exporta o roteador para ser usado no arquivo principal da aplicação.
