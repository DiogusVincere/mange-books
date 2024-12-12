const User = require('../models/user');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Cadastro de Usuário
exports.register = async (req, res) => {
    const { username, email, password, confirmPassword, fullName, birthDate, gender, cpf, phone, address } = req.body;

    // Verificar se as senhas correspondem
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'E-mail já cadastrado' });
    }

    // Verificar se o endereço foi fornecido corretamente
    if (!address || !address.cep || !address.numero) {
        return res.status(400).json({ message: 'Endereço incompleto ou ausente' });
    }

    // Consultar a API de CEP para preencher o endereço automaticamente
    const { cep, numero } = address;
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!cep || cep.length !== 8) {
            return res.status(400).json({ message: 'CEP inválido ou ausente' });
        }

        // Criar um novo usuário com o endereço preenchido
        const user = new User({
            username,
            email,
            password,
            fullName,
            birthDate,
            gender,
            cpf,
            phone,
            address: {
                cep,
                logradouro: response.data.logradouro,
                numero,
                bairro: response.data.bairro,
                cidade: response.data.localidade,
                estado: response.data.uf
            }
        });

        await user.save();
        res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    } catch (error) {
        console.error(error); // Para registrar erros que podem acontecer ao buscar o CEP.
        res.status(500).json({ message: 'Erro ao cadastrar usuário', error });
    }
};

// Login do Usuário
exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Gerar um token JWT
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login bem-sucedido', token });
};

// Listar todos os usuários
exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
};

// Obter um único usuário por ID
exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json(user);
};

// Atualizar um usuário
exports.updateUser = async (req, res) => {
    const updates = req.body;

    try {
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
};

// Excluir um usuário
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir usuário', error });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
      // Busca o usuário pelo ID presente no token
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.status(200).json(user); // Retorna os dados do usuário
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar dados do usuário", error });
    }
};

