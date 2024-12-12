const Reservation = require('../models/Reservation');
const LoanHistory = require('../models/LoanHistory');
const Book = require('../models/Book');

// Reservar um livro
exports.reserveBook = async (req, res) => {
    const { bookId } = req.body;
    const userId = req.userId;

    try {
        // Verificar se o livro já está reservado ou emprestado
        const existingReservation = await Reservation.findOne({ book: bookId, status: { $in: ['Reservado', 'Emprestado'] } });

        if (existingReservation) {
            return res.status(400).json({ message: 'Livro já reservado ou emprestado.' });
        }

        // Criar nova reserva
        const reservation = new Reservation({ book: bookId, user: userId });
        await reservation.save();

        res.status(201).json({ message: 'Livro reservado com sucesso.', reservation });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao reservar livro.', error });
    }
};

// Endpoint para buscar todas as reservas (ou reservas de um usuário)
exports.getReservations = async (req, res) => {
    const userId = req.userId; // Obtemos o ID do usuário logado (se necessário)

    try {
        console.log(`Buscando reservas para usuário: ${userId}`);

        // Buscando as reservas, populando as informações do livro e do usuário
        const reservations = await Reservation.find({ user: userId }) // Se quiser filtrar por usuário
            .populate('book')  // Popula as informações do livro (título, ISBN)
            .populate('user'); // Popula as informações do usuário (nome, cpf)

        console.log('Reservas encontradas:', reservations);
        res.status(200).json(reservations); // Retorna as reservas
    } catch (error) {
        console.error('Erro ao obter reservas:', error);
        res.status(500).json({ message: 'Erro ao obter reservas.', error });
    }
};

// Endpoint de empréstimo no backend
exports.loanBook = async (req, res) => {
    try {
      const { reservationId } = req.body;
      console.log('Tentando emprestar livro com ID:', reservationId);
  
      // Aqui você processaria o empréstimo
      const reservation = await Reservation.findById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva não encontrada.' });
      }
  
      // Atualizando o status da reserva
      reservation.status = 'Emprestado';
      await reservation.save();
  
      console.log('Livro emprestado com sucesso:', reservation);
      res.status(200).json({ message: 'Livro emprestado com sucesso!' });
    } catch (error) {
      console.error('Erro ao processar empréstimo:', error);
      res.status(500).json({ message: 'Erro ao processar empréstimo.' });
    }
};  


// Endpoint de devolução no backend
exports.returnBook = async (req, res) => {
    try {
      const { reservationId } = req.body;
      console.log('Tentando devolver livro com ID:', reservationId);
  
      const reservation = await Reservation.findById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva não encontrada.' });
      }
  
      // Se o status for 'Emprestado', podemos processar a devolução
      if (reservation.status !== 'Emprestado') {
        return res.status(400).json({ message: 'O livro não pode ser devolvido. Status inválido.' });
      }
  
      // Atualizando o status da reserva para 'Devolvido'
      reservation.status = 'Devolvido';
      await reservation.save();
  
      console.log('Livro devolvido com sucesso:', reservation);
      res.status(200).json({ message: 'Livro devolvido com sucesso!' });
    } catch (error) {
      console.error('Erro ao processar devolução:', error);
      res.status(500).json({ message: 'Erro ao processar devolução.' });
    }
};  

// Histórico de empréstimos baseado nas reservas
exports.getLoanHistory = async (req, res) => {
    const userId = req.userId;  // Obter o ID do usuário logado (se necessário)

    try {
        console.log(`Buscando histórico de empréstimos para o usuário: ${userId}`);
        
        // Buscar as reservas com status "Emprestado"
        const loanHistory = await Reservation.find({ user: userId, status: 'Emprestado' })
            .populate('book', 'title isbn') // Preenche informações do livro (titulo, ISBN)
            .populate('user', 'fullName cpf'); // Preenche informações do usuário (nome completo, cpf)

        console.log('Histórico encontrado:', loanHistory);
        
        res.status(200).json(loanHistory);  // Retorna o histórico de empréstimos
    } catch (error) {
        console.error('Erro ao obter histórico de empréstimos:', error);
        res.status(500).json({ message: 'Erro ao obter histórico de empréstimos.', error });
    }
};



