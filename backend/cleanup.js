require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        // Remover registros onde o campo 'username' é null ou não existe
        const result = await User.deleteMany({ $or: [{ username: null }, { username: { $exists: false } }] });
        console.log(`Registros removidos: ${result.deletedCount}`);
        mongoose.connection.close();
    })
    .catch(error => {
        console.error("Erro ao conectar ao banco de dados:", error);
    });
