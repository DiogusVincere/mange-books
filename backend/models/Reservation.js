const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['Reservado', 'Emprestado', 'Devolvido'], 
        default: 'Reservado' 
    },
    reservedAt: { type: Date, default: Date.now },
    loanedAt: { type: Date },
    returnedAt: { type: Date },
});

module.exports = mongoose.model('Reservation', reservationSchema);
