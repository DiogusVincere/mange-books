const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');

// Quantas reservas/empréstimos em aberto um leitor pode ter ao mesmo tempo
const LIMITE_ATIVAS = 3;

const POPULAR = [
    { path: 'book', select: 'title author coverImage isbn genre' },
    { path: 'user', select: 'fullName email cpf username' },
];

const responderErro = (res, error, mensagem) => {
    if (error && error.name === 'CastError') {
        return res.status(400).json({ message: 'Identificador inválido' });
    }
    console.error(mensagem + ':', error);
    res.status(500).json({ message: mensagem });
};

// Reservar um livro (qualquer usuário logado)
exports.reserveBook = async (req, res) => {
    const { bookId } = req.body;
    if (!mongoose.isValidObjectId(bookId)) {
        return res.status(400).json({ message: 'Livro inválido' });
    }
    try {
        const livro = await Book.findById(bookId);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });

        const ativa = await Reservation.findOne({ book: bookId, status: { $in: Reservation.ATIVOS } });
        if (ativa) {
            const minha = String(ativa.user) === String(req.userId);
            return res.status(400).json({
                message: minha ? 'Você já reservou este livro' : 'Este livro já está reservado ou emprestado para outro leitor',
            });
        }
        const minhasAtivas = await Reservation.countDocuments({ user: req.userId, status: { $in: Reservation.ATIVOS } });
        if (minhasAtivas >= LIMITE_ATIVAS) {
            return res.status(400).json({ message: `Você já tem ${LIMITE_ATIVAS} reservas ou empréstimos em aberto` });
        }

        const reservation = await Reservation.create({ book: bookId, user: req.userId });
        await reservation.populate(POPULAR);
        res.status(201).json({ message: `"${livro.title}" reservado. Retire na biblioteca.`, reservation });
    } catch (error) {
        responderErro(res, error, 'Erro ao reservar livro');
    }
};

// Reservas do próprio usuário (todas as situações)
exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.userId }).sort({ reservedAt: -1 }).populate(POPULAR);
        res.status(200).json(reservations);
    } catch (error) {
        responderErro(res, error, 'Erro ao obter reservas');
    }
};

// Todas as reservas (bibliotecário). ?status=Reservado filtra.
exports.getAllReservations = async (req, res) => {
    try {
        const filtro = {};
        if (Reservation.STATUS.includes(req.query.status)) filtro.status = req.query.status;
        const reservations = await Reservation.find(filtro).sort({ reservedAt: -1 }).limit(500).populate(POPULAR);
        res.status(200).json(reservations);
    } catch (error) {
        responderErro(res, error, 'Erro ao obter reservas');
    }
};

// Registrar a retirada (bibliotecário): Reservado -> Emprestado
exports.loanBook = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.body.reservationId);
        if (!reservation) return res.status(404).json({ message: 'Reserva não encontrada' });
        if (reservation.status !== 'Reservado') {
            return res.status(400).json({ message: `Só uma reserva em aberto pode virar empréstimo (situação atual: ${reservation.status})` });
        }
        reservation.status = 'Emprestado';
        reservation.loanedAt = new Date();
        await reservation.save();
        await reservation.populate(POPULAR);
        res.status(200).json({ message: 'Empréstimo registrado', reservation });
    } catch (error) {
        responderErro(res, error, 'Erro ao registrar empréstimo');
    }
};

// Registrar a devolução (bibliotecário): Emprestado -> Devolvido
exports.returnBook = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.body.reservationId);
        if (!reservation) return res.status(404).json({ message: 'Reserva não encontrada' });
        if (reservation.status !== 'Emprestado') {
            return res.status(400).json({ message: `Só um livro emprestado pode ser devolvido (situação atual: ${reservation.status})` });
        }
        reservation.status = 'Devolvido';
        reservation.returnedAt = new Date();
        await reservation.save();
        await reservation.populate(POPULAR);
        res.status(200).json({ message: 'Devolução registrada', reservation });
    } catch (error) {
        responderErro(res, error, 'Erro ao registrar devolução');
    }
};

// Cancelar uma reserva ainda não retirada: o próprio leitor ou um bibliotecário
exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.body.reservationId);
        if (!reservation) return res.status(404).json({ message: 'Reserva não encontrada' });
        const minha = String(reservation.user) === String(req.userId);
        if (!minha && req.papel !== 'bibliotecario') {
            return res.status(403).json({ message: 'Você só pode cancelar as suas reservas' });
        }
        if (reservation.status !== 'Reservado') {
            return res.status(400).json({ message: `Só uma reserva em aberto pode ser cancelada (situação atual: ${reservation.status})` });
        }
        reservation.status = 'Cancelado';
        reservation.canceledAt = new Date();
        await reservation.save();
        await reservation.populate(POPULAR);
        res.status(200).json({ message: 'Reserva cancelada', reservation });
    } catch (error) {
        responderErro(res, error, 'Erro ao cancelar reserva');
    }
};

// Histórico do próprio usuário: o que já foi retirado (emprestado ou devolvido)
exports.getLoanHistory = async (req, res) => {
    try {
        const historico = await Reservation.find({ user: req.userId, status: { $in: ['Emprestado', 'Devolvido'] } })
            .sort({ loanedAt: -1 })
            .populate(POPULAR);
        res.status(200).json(historico);
    } catch (error) {
        responderErro(res, error, 'Erro ao obter histórico');
    }
};
