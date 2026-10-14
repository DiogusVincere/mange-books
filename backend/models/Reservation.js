const mongoose = require('mongoose');

// Ciclo de vida: Reservado -> Emprestado -> Devolvido. Uma reserva ainda não
// retirada pode virar Cancelado (pelo leitor ou pelo bibliotecário).
const STATUS = ['Reservado', 'Emprestado', 'Devolvido', 'Cancelado'];

const reservationSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: STATUS, default: 'Reservado' },
    reservedAt: { type: Date, default: Date.now },
    loanedAt: { type: Date },
    returnedAt: { type: Date },
    canceledAt: { type: Date },
});

reservationSchema.index({ book: 1, status: 1 });
reservationSchema.index({ user: 1, reservedAt: -1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
Reservation.STATUS = STATUS;
Reservation.ATIVOS = ['Reservado', 'Emprestado'];
module.exports = Reservation;
