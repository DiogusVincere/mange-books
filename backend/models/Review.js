const mongoose = require('mongoose'); // Importa o mongoose para definir e manipular esquemas e modelos no MongoDB.

// Define o esquema para as avaliações
const reviewSchema = new mongoose.Schema({
    bookId: { 
        type: mongoose.Schema.Types.ObjectId, // Referencia o ID de um documento na coleção "Book".
        ref: 'Book', // Estabelece a referência para o modelo "Book".
        required: true // Torna obrigatório associar a avaliação a um livro.
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, // Referencia o ID de um documento na coleção "User".
        ref: 'User', // Estabelece a referência para o modelo "User".
        required: true // Torna obrigatório associar a avaliação a um usuário.
    },
    userName: { 
        type: String, // Define o nome do usuário como uma string.
        required: true // Torna obrigatório especificar o nome do usuário.
    },
    userProfileImage: { 
        type: String, // Define o caminho para a imagem de perfil do usuário como uma string.
        required: true // Torna obrigatório fornecer uma imagem de perfil.
    },
    rating: { 
        type: Number, // Define a nota da avaliação como um número.
        required: true, // Torna obrigatório especificar uma nota.
        min: 1, // Define o valor mínimo permitido para a nota.
        max: 5 // Define o valor máximo permitido para a nota.
    },
    comment: { 
        type: String, // Define o comentário da avaliação como uma string.
        required: false // Torna opcional o fornecimento de um comentário.
    }
}, { timestamps: true }); // Adiciona automaticamente campos "createdAt" e "updatedAt" ao esquema.

// Exporta o modelo baseado no esquema de avaliações para uso em outras partes da aplicação.
module.exports = mongoose.model('Review', reviewSchema);
