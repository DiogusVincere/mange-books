// routes/reports.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/user');

// Rota para retornar livros mais reservados
router.get('/books', async (req, res) => {
  try {
    const books = await Book.aggregate([
      { $group: { _id: '$title', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json(books.map(book => ({ name: book._id, count: book.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para retornar usuários mais ativos
router.get('/users', async (req, res) => {
  try {
    const users = await User.aggregate([
      { $group: { _id: '$username', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.status(200).json(users.map(user => ({ name: user._id, count: user.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para retornar livros com melhores avaliações
router.get('/ratings', async (req, res) => {
  try {
    // Implementar lógica de obtenção das melhores avaliações
    res.status(200).json([
      { name: 'Livro A', count: 5 },
      { name: 'Livro B', count: 4.8 },
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
