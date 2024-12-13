// Importa o modelo de usuário do diretório de modelos
const User = require('../models/user');

// Importa a biblioteca bcrypt para hashing de senhas
const bcrypt = require('bcryptjs');

// Importa a biblioteca axios para realizar requisições HTTP
const axios = require('axios');

// Importa a biblioteca jsonwebtoken para criação e verificação de tokens JWT
const jwt = require('jsonwebtoken');

// Cadastro de Usuário
exports.register = async (req, res) => {
    // Extrai os dados do corpo da requisição
    const { username, email, password, confirmPassword, fullName, birthDate, gender, cpf, phone, address } = req.body;

    // Verifica se as senhas fornecidas pelo usuário são iguais
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    // Verifica se o e-mail já está cadastrado no banco de dados
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'E-mail já cadastrado' });
    }

    // Valida se o endereço possui as informações mínimas requeridas
    if (!address || !address.cep || !address.numero) {
        return res.status(400).json({ message: 'Endereço incompleto ou ausente' });
    }

    // Extrai o CEP e número do endereço fornecido pelo usuário
    const { cep, numero } = address;
    try {
        // Faz uma requisição à API de CEP para obter informações detalhadas sobre o endereço
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!cep || cep.length !== 8) {
            return res.status(400).json({ message: 'CEP inválido ou ausente' });
        }

        // Cria um novo usuário com os dados fornecidos e o endereço detalhado
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

        // Salva o novo usuário no banco de dados
        await user.save();
        res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    } catch (error) {
        // Loga e retorna um erro caso ocorra falha na consulta ou cadastro
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário', error });
    }
};

// Login do Usuário
exports.login = async (req, res) => {
    // Extrai o e-mail e senha do corpo da requisição
    const { email, password } = req.body;

    // Busca um usuário pelo e-mail fornecido
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    // Verifica se a senha fornecida corresponde à senha armazenada
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Gera um token JWT para autenticação do usuário
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Retorna uma mensagem de sucesso com o token gerado
    res.status(200).json({ message: 'Login bem-sucedido', token });
};

// Listar todos os usuários
exports.getAllUsers = async (req, res) => {
    // Busca todos os usuários no banco de dados
    const users = await User.find();
    res.status(200).json(users); // Retorna a lista de usuários
};

// Obter um único usuário por ID
exports.getUserById = async (req, res) => {
    // Busca o usuário pelo ID fornecido nos parâmetros da requisição
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json(user); // Retorna os dados do usuário encontrado
};

// Atualizar um usuário
exports.updateUser = async (req, res) => {
    // Extrai os dados de atualização do corpo da requisição
    const updates = req.body;

    try {
        // Atualiza o usuário com o ID fornecido, retornando o novo estado
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user); // Retorna o usuário atualizado
    } catch (error) {
        // Retorna um erro caso algo dê errado durante a atualização
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
};

// Excluir um usuário
exports.deleteUser = async (req, res) => {
    try {
        // Exclui o usuário com o ID fornecido
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso' }); // Confirma a exclusão
    } catch (error) {
        // Retorna um erro caso algo dê errado durante a exclusão
        res.status(500).json({ message: 'Erro ao excluir usuário', error });
    }
};

// Obter o perfil do usuário logado
exports.getUserProfile = async (req, res) => {
    try {
        // Busca o usuário pelo ID presente no token de autenticação
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.status(200).json(user); // Retorna os dados do usuário logado
    } catch (error) {
        // Retorna um erro caso algo dê errado durante a consulta do perfil
        res.status(500).json({ message: "Erro ao buscar dados do usuário", error });
    }
};