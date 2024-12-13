require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env para o ambiente de execução
const mongoose = require('mongoose'); // Importa o módulo mongoose, que é usado para interagir com o MongoDB
const User = require('./models/user'); // Importa o modelo de usuário, que será usado para interagir com a coleção de usuários no banco de dados

// Conecta ao banco de dados MongoDB usando a URI definida na variável de ambiente MONGO_URI
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => { // Se a conexão for bem-sucedida, executa o bloco de código assíncrono
        // Remove registros de usuários onde o campo 'username' é null ou não existe
        const result = await User.deleteMany({ $or: [{ username: null }, { username: { $exists: false } }] });
        console.log(`Registros removidos: ${result.deletedCount}`); // Exibe o número de registros removidos
        mongoose.connection.close(); // Fecha a conexão com o banco de dados após a remoção
    })
    .catch(error => { // Caso ocorra um erro na conexão com o banco de dados
        console.error("Erro ao conectar ao banco de dados:", error); // Exibe o erro no console
    });
