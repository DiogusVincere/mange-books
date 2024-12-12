const mongoose = require('mongoose');

const loanHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    loanedAt: { type: Date, required: true },
    returnedAt: { type: Date, required: true },
});

module.exports = mongoose.model('LoanHistory', loanHistorySchema);
