require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const books = require('./routes/books');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reportsRoutes = require('./routes/reportsRoutes')

const app = express();

// Configura o CORS antes das rotas
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Middleware para processar requisições JSON
app.use(express.json());

// Configura as rotas
app.use('/books', books);
app.use('/api/auth', authRoutes);
app.use('/reviews', reviewRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportsRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
})
.catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
