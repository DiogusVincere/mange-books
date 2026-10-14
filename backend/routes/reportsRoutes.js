// Relatórios (só bibliotecários), calculados sobre os dados reais.
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/user');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const { authMiddleware, somenteBibliotecario } = require('../middleware/auth');

router.use(authMiddleware, somenteBibliotecario);

const erro = (res, error, mensagem) => {
    console.error(mensagem + ':', error);
    res.status(500).json({ message: mensagem });
};

// Números gerais para os cartões do painel
router.get('/resumo', async (req, res) => {
    try {
        const [livros, usuarios, reservadas, emprestados, devolvidos, avaliacoes, media, porGenero] = await Promise.all([
            Book.countDocuments(),
            User.countDocuments(),
            Reservation.countDocuments({ status: 'Reservado' }),
            Reservation.countDocuments({ status: 'Emprestado' }),
            Reservation.countDocuments({ status: 'Devolvido' }),
            Review.countDocuments(),
            Review.aggregate([{ $group: { _id: null, media: { $avg: '$rating' } } }]),
            Book.aggregate([{ $group: { _id: '$genre', total: { $sum: 1 } } }, { $sort: { total: -1, _id: 1 } }]),
        ]);
        res.status(200).json({
            livros,
            usuarios,
            reservasAtivas: reservadas,
            emprestimosAtivos: emprestados,
            devolucoes: devolvidos,
            avaliacoes,
            notaMediaGeral: media[0] ? Math.round(media[0].media * 10) / 10 : null,
            porGenero: porGenero.map((g) => ({ name: g._id, count: g.total })),
        });
    } catch (error) {
        erro(res, error, 'Erro ao montar o resumo');
    }
});

// Livros mais reservados (reservas canceladas não contam)
router.get('/books', async (req, res) => {
    try {
        const dados = await Reservation.aggregate([
            { $match: { status: { $ne: 'Cancelado' } } },
            { $group: { _id: '$book', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'livro' } },
            { $unwind: '$livro' },
            { $project: { _id: 0, id: '$_id', name: '$livro.title', author: '$livro.author', count: 1 } },
        ]);
        res.status(200).json(dados);
    } catch (error) {
        erro(res, error, 'Erro ao calcular livros mais reservados');
    }
});

// Leitores mais ativos (por reservas não canceladas)
router.get('/users', async (req, res) => {
    try {
        const dados = await Reservation.aggregate([
            { $match: { status: { $ne: 'Cancelado' } } },
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'usuario' } },
            { $unwind: '$usuario' },
            { $project: { _id: 0, id: '$_id', name: '$usuario.fullName', count: 1 } },
        ]);
        res.status(200).json(dados);
    } catch (error) {
        erro(res, error, 'Erro ao calcular leitores mais ativos');
    }
});

// Livros mais bem avaliados (count = nota média; total = quantidade de avaliações)
router.get('/ratings', async (req, res) => {
    try {
        const dados = await Review.aggregate([
            { $group: { _id: '$bookId', media: { $avg: '$rating' }, total: { $sum: 1 } } },
            { $sort: { media: -1, total: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'livro' } },
            { $unwind: '$livro' },
            { $project: { _id: 0, id: '$_id', name: '$livro.title', author: '$livro.author', count: { $round: ['$media', 1] }, total: 1 } },
        ]);
        res.status(200).json(dados);
    } catch (error) {
        erro(res, error, 'Erro ao calcular avaliações');
    }
});

module.exports = router;
