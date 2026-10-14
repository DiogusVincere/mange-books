// Monta a aplicação Express (CORS, JSON, uploads e rotas) sem conectar ao banco nem
// abrir porta. server.js faz isso; separar permite reaproveitar o app nos testes.
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const books = require('./routes/books');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
app.disable('x-powered-by');

// CORS: origens fixas vêm de CORS_ORIGIN (separadas por vírgula). Além delas, os
// deploys de pré-visualização do próprio front na Vercel (mange-books-*.vercel.app).
const origensFixas = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean);
const PREVIEW_VERCEL = /^https:\/\/mange-books(-[a-z0-9-]+)?\.vercel\.app$/i;

app.use(cors({
    origin(origem, callback) {
        if (!origem || origensFixas.includes(origem) || PREVIEW_VERCEL.test(origem)) return callback(null, true);
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// Capas enviadas pelo multer (pasta resolvida a partir deste arquivo)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

// Verificação rápida de que a API está de pé
app.get('/', (req, res) => {
    res.json({ nome: 'API do Mange Books', status: 'ok', demo: app.locals.modoDemo === true });
});

app.use('/books', books);
app.use('/api/auth', authRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportsRoutes);

// Rota inexistente
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// Erros não tratados (upload grande, JSON inválido, etc.)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const mensagem = err.code === 'LIMIT_FILE_SIZE' ? 'A imagem deve ter no máximo 2 MB' : 'Arquivo inválido';
        return res.status(400).json({ message: mensagem });
    }
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'JSON inválido' });
    }
    if (err && err.status) {
        return res.status(err.status).json({ message: err.message });
    }
    console.error('Erro não tratado:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

module.exports = app;
