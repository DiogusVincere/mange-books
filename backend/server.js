// Ponto de entrada: carrega o .env, conecta ao MongoDB e sobe o servidor HTTP.
// A aplicação em si (rotas, CORS, uploads) está em app.js.
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error('Faltam variáveis de ambiente: copie backend/.env.example para backend/.env e preencha MONGO_URI e JWT_SECRET.');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Conectado ao MongoDB com sucesso!');
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    });
