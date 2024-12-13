const mongoose = require('mongoose'); // Importa o mongoose para manipulação de modelos e esquemas no MongoDB.

// Define o esquema de reservas com campos e validações
const reservationSchema = new mongoose.Schema({
    book: { 
        type: mongoose.Schema.Types.ObjectId, // Referencia o ID de um documento na coleção "Book".
        ref: 'Book', // Define a referência para o modelo "Book".
        required: true // Torna obrigatório especificar um livro para a reserva.
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, // Referencia o ID de um documento na coleção "User".
        ref: 'User', // Define a referência para o modelo "User".
        required: true // Torna obrigatório especificar um usuário para a reserva.
    },
    status: { 
        type: String, // Define o status como uma string.
        enum: ['Reservado', 'Emprestado', 'Devolvido'], // Valores permitidos para o status.
        default: 'Reservado' // Valor padrão para o status caso não seja especificado.
    },
    reservedAt: { 
        type: Date, // Campo para a data em que a reserva foi feita.
        default: Date.now // Define o valor padrão como a data/hora atual.
    },
    loanedAt: { 
        type: Date // Campo opcional para a data em que o livro foi emprestado.
    },
    returnedAt: { 
        type: Date // Campo opcional para a data em que o livro foi devolvido.
    },
});

// Exporta o modelo baseado no esquema de reservas para ser usado em outras partes da aplicação.
module.exports = mongoose.model('Reservation', reservationSchema);
