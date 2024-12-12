const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const bookRoutes = require('../routes/books');  // O caminho deve ser corrigido se necessário
const app = express();

// Middleware de autenticação
exports.authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token recebido:', token);
    
    if (!token) {
        return res.status(401).json({ message: 'Acesso não autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;  // Armazena o ID do usuário no request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Usando as rotas corretamente
app.use('/api/books', bookRoutes);  // Passa o router, não o objeto
