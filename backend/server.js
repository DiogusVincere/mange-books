require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env para o ambiente de execução
const express = require('express'); // Importa o módulo Express, usado para criar o servidor
const mongoose = require('mongoose'); // Importa o módulo Mongoose, usado para interagir com o MongoDB
const cors = require('cors'); // Importa o módulo CORS, utilizado para habilitar controle de acesso entre origens
const bodyParser = require('body-parser'); // Importa o módulo Body-Parser, usado para analisar o corpo das requisições

// Importação das rotas específicas de cada funcionalidade
const books = require('./routes/books'); // Rota para lidar com livros
const authRoutes = require('./routes/authRoutes'); // Rota para autenticação
const reviewRoutes = require('./routes/reviewRoutes'); // Rota para comentários/avaliações
const reservationRoutes = require('./routes/reservationRoutes'); // Rota para reservas
const reportsRoutes = require('./routes/reportsRoutes'); // Rota para relatórios

const app = express(); // Cria uma instância do servidor Express

// Configura o CORS para permitir requisições da origem 'http://localhost:5173'
// Define os métodos HTTP permitidos: GET, POST, PUT, DELETE
app.use(cors({
    origin: 'http://localhost:5173', // Permite acesso apenas de 'http://localhost:5173'
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Define os métodos permitidos para as requisições
}));

app.use(bodyParser.json()); // Middleware para processar requisições com corpo no formato JSON
app.use('/uploads', express.static('uploads')); // Serve arquivos estáticos (como imagens) do diretório 'uploads'

// Middleware para processar requisições com corpo JSON
app.use(express.json()); 

// Configura as rotas do servidor, associando os endpoints às rotas apropriadas
app.use('/books', books); // Rota para livros
app.use('/api/auth', authRoutes); // Rota para autenticação
app.use('/reviews', reviewRoutes); // Rota para comentários/avaliações
app.use('/api/reservations', reservationRoutes); // Rota para reservas
app.use('/api/reports', reportsRoutes); // Rota para relatórios

// Conexão com o MongoDB usando a URI armazenada na variável de ambiente MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // Usa o novo parser de URL do MongoDB
    useUnifiedTopology: true, // Usa a topologia unificada para evitar problemas com o driver do MongoDB
})
.then(() => { // Se a conexão for bem-sucedida
    console.log('Conectado ao MongoDB com sucesso!'); // Exibe mensagem de sucesso no console
})
.catch((error) => { // Se ocorrer um erro na conexão
    console.error('Erro ao conectar ao MongoDB:', error); // Exibe mensagem de erro no console
});

// Define a porta em que o servidor irá escutar, usando a variável de ambiente PORT ou 5000 como padrão
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { // Inicia o servidor na porta definida
    console.log(`Servidor rodando na porta ${PORT}`); // Exibe mensagem indicando que o servidor está em execução
});