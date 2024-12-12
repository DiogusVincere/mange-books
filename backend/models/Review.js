const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book', // Referência ao modelo de livro
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Referência ao modelo de usuário
        required: true 
    },
    userName: { 
        type: String, 
        required: true 
    },
    userProfileImage: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
