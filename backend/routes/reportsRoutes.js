const express = require('express'); // Importa o módulo Express
const router = express.Router(); // Cria um roteador do Express para gerenciar as rotas
const Book = require('../models/Book'); // Importa o modelo Book, que representa os livros no banco de dados
const User = require('../models/user'); // Importa o modelo User, que representa os usuários no banco de dados

// Rota para retornar livros mais reservados
router.get('/books', async (req, res) => { // Define uma rota GET para buscar os livros mais reservados
  try {
    // Realiza uma agregação no MongoDB para contar o número de reservas por título de livro
    const books = await Book.aggregate([
      { $group: { _id: '$title', count: { $sum: 1 } } }, // Agrupa os livros por título e conta as ocorrências
      { $sort: { count: -1 } }, // Ordena os livros pelo número de reservas em ordem decrescente
      { $limit: 10 }, // Limita o resultado aos 10 livros mais reservados
    ]);
    // Retorna os 10 livros mais reservados no formato desejado
    res.status(200).json(books.map(book => ({ name: book._id, count: book.count })));
  } catch (error) { // Em caso de erro
    res.status(500).json({ message: error.message }); // Retorna um erro com a mensagem do erro
  }
});

// Rota para retornar usuários mais ativos
router.get('/users', async (req, res) => { // Define uma rota GET para buscar os usuários mais ativos
  try {
    // Realiza uma agregação no MongoDB para contar o número de ações (como reservas) por usuário
    const users = await User.aggregate([
      { $group: { _id: '$username', count: { $sum: 1 } } }, // Agrupa os usuários por nome e conta as ocorrências
      { $sort: { count: -1 } }, // Ordena os usuários pelo número de ações em ordem decrescente
      { $limit: 10 }, // Limita o resultado aos 10 usuários mais ativos
    ]);
    // Retorna os 10 usuários mais ativos no formato desejado
    res.status(200).json(users.map(user => ({ name: user._id, count: user.count })));
  } catch (error) { // Em caso de erro
    res.status(500).json({ message: error.message }); // Retorna um erro com a mensagem do erro
  }
});

// Rota para retornar livros com melhores avaliações
router.get('/ratings', async (req, res) => { // Define uma rota GET para buscar livros com melhores avaliações
  try {
    // Lógica de exemplo que retorna livros com avaliações fictícias (a ser implementada posteriormente)
    res.status(200).json([ // Retorna os livros com as melhores avaliações
      { name: 'Livro A', count: 5 }, // Exemplo de livro com nota 5
      { name: 'Livro B', count: 4.8 }, // Exemplo de livro com nota 4.8
    ]);
  } catch (error) { // Em caso de erro
    res.status(500).json({ message: error.message }); // Retorna um erro com a mensagem do erro
  }
});

module.exports = router; // Exporta o roteador para que possa ser usado em outros arquivos