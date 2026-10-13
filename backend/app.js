// Monta a aplicação Express (CORS, JSON, uploads e rotas) sem conectar ao banco nem
// abrir porta. server.js faz isso; separar permite reaproveitar o app em testes ou
// em um ambiente serverless.
const path = require('path');
const express = require('express');
const cors = require('cors');

const books = require('./routes/books');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();

// CORS: as origens autorizadas vêm da variável CORS_ORIGIN (separadas por vírgula).
// Sem a variável, aceita só o front em desenvolvimento.
const origensPermitidas = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean);
app.use(cors({
    origin: origensPermitidas,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Capas enviadas pelo multer (pasta resolvida a partir deste arquivo)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Verificação rápida de que a API está de pé
app.get('/', (req, res) => {
    res.json({ nome: 'API do Mange Book', status: 'ok' });
});

app.use('/books', books);
app.use('/api/auth', authRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportsRoutes);

module.exports = app;
