// Ponto de entrada: carrega o .env, conecta ao MongoDB e sobe o servidor HTTP.
// A aplicação em si (rotas, CORS, uploads) está em app.js.
//
// Dois modos:
//   - Normal: MONGO_URI definido (Atlas ou Mongo local). JWT_SECRET obrigatório.
//   - Demonstração: sem MONGO_URI. Sobe um MongoDB embutido no próprio processo
//     (mongodb-memory-server), popula com o seed e gera um JWT_SECRET temporário.
//     Os dados vivem só enquanto o processo vive — é o modo usado na demo pública,
//     onde o serviço gratuito reinicia e volta sempre com os dados de exemplo.
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MODO_DEMO = !process.env.MONGO_URI;

async function obterUri() {
    if (!MODO_DEMO) return process.env.MONGO_URI;
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({ instance: { dbName: 'mangebook' } });
    console.log('Modo demonstração: MongoDB embutido iniciado (os dados somem ao reiniciar).');
    return mongod.getUri();
}

async function iniciar() {
    if (MODO_DEMO && !process.env.JWT_SECRET) {
        process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
        console.log('Modo demonstração: JWT_SECRET temporário gerado (os logins caem ao reiniciar).');
    }
    if (!process.env.JWT_SECRET) {
        console.error('Falta JWT_SECRET: copie backend/.env.example para backend/.env e preencha.');
        process.exit(1);
    }

    const uri = await obterUri();
    await mongoose.connect(uri);
    console.log('Conectado ao MongoDB com sucesso!');

    if (MODO_DEMO) {
        const { seed } = require('./seed');
        await seed();
    }

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}${MODO_DEMO ? ' (modo demonstração)' : ''}`);
    });
}

iniciar().catch((error) => {
    console.error('Erro ao iniciar:', error.message);
    process.exit(1);
});
