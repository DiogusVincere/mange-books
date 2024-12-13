const Reservation = require('../models/Reservation'); // Importa o modelo de reservas.
const LoanHistory = require('../models/LoanHistory'); // Importa o modelo do histórico de empréstimos.
const Book = require('../models/Book'); // Importa o modelo de livros.

// Reservar um livro
exports.reserveBook = async (req, res) => {
    const { bookId } = req.body; // Obtém o ID do livro do corpo da requisição.
    const userId = req.userId; // Obtém o ID do usuário autenticado.

    try {
        // Verificar se o livro já está reservado ou emprestado.
        const existingReservation = await Reservation.findOne({ book: bookId, status: { $in: ['Reservado', 'Emprestado'] } });

        if (existingReservation) {
            return res.status(400).json({ message: 'Livro já reservado ou emprestado.' }); // Retorna erro se o livro já estiver reservado ou emprestado.
        }

        // Criar nova reserva.
        const reservation = new Reservation({ book: bookId, user: userId }); // Cria um novo documento de reserva.
        await reservation.save(); // Salva a reserva no banco de dados.

        res.status(201).json({ message: 'Livro reservado com sucesso.', reservation }); // Retorna sucesso e a reserva criada.
    } catch (error) {
        res.status(500).json({ message: 'Erro ao reservar livro.', error }); // Retorna erro genérico em caso de falha.
    }
};

// Endpoint para buscar todas as reservas (ou reservas de um usuário)
exports.getReservations = async (req, res) => {
    const userId = req.userId; // Obtém o ID do usuário autenticado.

    try {
        console.log(`Buscando reservas para usuário: ${userId}`); // Log para monitoramento.

        // Busca as reservas do usuário, populando as informações relacionadas.
        const reservations = await Reservation.find({ user: userId })
            .populate('book')  // Preenche os detalhes do livro (ex.: título, ISBN).
            .populate('user'); // Preenche os detalhes do usuário (ex.: nome, CPF).

        console.log('Reservas encontradas:', reservations); // Log das reservas encontradas.
        res.status(200).json(reservations); // Retorna as reservas encontradas.
    } catch (error) {
        console.error('Erro ao obter reservas:', error); // Log do erro.
        res.status(500).json({ message: 'Erro ao obter reservas.', error }); // Retorna erro genérico em caso de falha.
    }
};

// Endpoint de empréstimo no backend
exports.loanBook = async (req, res) => {
    try {
        const { reservationId } = req.body; // Obtém o ID da reserva do corpo da requisição.
        console.log('Tentando emprestar livro com ID:', reservationId); // Log para monitoramento.

        // Busca a reserva pelo ID fornecido.
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({ message: 'Reserva não encontrada.' }); // Retorna erro se a reserva não existir.
        }

        // Atualiza o status da reserva para "Emprestado".
        reservation.status = 'Emprestado';
        await reservation.save(); // Salva as alterações no banco de dados.

        console.log('Livro emprestado com sucesso:', reservation); // Log de sucesso.
        res.status(200).json({ message: 'Livro emprestado com sucesso!' }); // Retorna sucesso.
    } catch (error) {
        console.error('Erro ao processar empréstimo:', error); // Log do erro.
        res.status(500).json({ message: 'Erro ao processar empréstimo.' }); // Retorna erro genérico em caso de falha.
    }
};

// Endpoint de devolução no backend
exports.returnBook = async (req, res) => {
    try {
        const { reservationId } = req.body; // Obtém o ID da reserva do corpo da requisição.
        console.log('Tentando devolver livro com ID:', reservationId); // Log para monitoramento.

        const reservation = await Reservation.findById(reservationId); // Busca a reserva pelo ID.

        if (!reservation) {
            return res.status(404).json({ message: 'Reserva não encontrada.' }); // Retorna erro se a reserva não existir.
        }

        // Verifica se o status da reserva permite devolução.
        if (reservation.status !== 'Emprestado') {
            return res.status(400).json({ message: 'O livro não pode ser devolvido. Status inválido.' }); // Retorna erro se o status for inválido.
        }

        // Atualiza o status da reserva para "Devolvido".
        reservation.status = 'Devolvido';
        await reservation.save(); // Salva as alterações no banco de dados.

        console.log('Livro devolvido com sucesso:', reservation); // Log de sucesso.
        res.status(200).json({ message: 'Livro devolvido com sucesso!' }); // Retorna sucesso.
    } catch (error) {
        console.error('Erro ao processar devolução:', error); // Log do erro.
        res.status(500).json({ message: 'Erro ao processar devolução.' }); // Retorna erro genérico em caso de falha.
    }
};

// Histórico de empréstimos baseado nas reservas
exports.getLoanHistory = async (req, res) => {
    const userId = req.userId; // Obtém o ID do usuário autenticado.

    try {
        console.log(`Buscando histórico de empréstimos para o usuário: ${userId}`); // Log para monitoramento.

        // Busca o histórico de empréstimos para o usuário.
        const loanHistory = await Reservation.find({ user: userId, status: 'Emprestado' })
            .populate('book', 'title isbn') // Preenche informações do livro (ex.: título, ISBN).
            .populate('user', 'fullName cpf'); // Preenche informações do usuário (ex.: nome completo, CPF).

        console.log('Histórico encontrado:', loanHistory); // Log do histórico encontrado.
        res.status(200).json(loanHistory); // Retorna o histórico de empréstimos.
    } catch (error) {
        console.error('Erro ao obter histórico de empréstimos:', error); // Log do erro.
        res.status(500).json({ message: 'Erro ao obter histórico de empréstimos.', error }); // Retorna erro genérico em caso de falha.
    }
};