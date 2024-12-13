const express = require('express'); // Importa o framework Express para facilitar a criação do servidor.
const jwt = require('jsonwebtoken'); // Importa o pacote JWT para manipular tokens de autenticação.
const config = require('../config/config'); // Importa as configurações do aplicativo (caminho pode variar).
const bookRoutes = require('../routes/books'); // Importa as rotas relacionadas a livros (verificar se o caminho está correto).
const app = express(); // Cria uma instância do Express.

// Middleware de autenticação
exports.authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extrai o token do cabeçalho Authorization, removendo o prefixo 'Bearer '.
    console.log('Token recebido:', token); // Loga o token recebido para depuração.
    
    if (!token) { // Verifica se o token está presente.
        return res.status(401).json({ message: 'Acesso não autorizado' }); // Retorna erro 401 caso o token não seja fornecido.
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decodifica e verifica a validade do token usando a chave secreta.
        req.userId = decoded.userId; // Armazena o ID do usuário no objeto de requisição para uso posterior.
        next(); // Prossegue para o próximo middleware ou rota.
    } catch (error) { // Captura erros de decodificação ou token inválido.
        res.status(401).json({ message: 'Token inválido' }); // Retorna erro 401 para token inválido ou expirado.
    }
};

// Usando as rotas corretamente
app.use('/api/books', bookRoutes); // Registra as rotas relacionadas a livros no caminho '/api/books'.