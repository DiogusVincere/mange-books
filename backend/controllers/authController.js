const User = require('../models/user');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Campos que podem ser alterados pelo PUT /api/auth/:id. A senha fica de fora de
// propósito: findByIdAndUpdate não passa pelo pre('save') que faz o hash, então uma
// senha nova chegaria em texto puro no banco.
const CAMPOS_EDITAVEIS = ['username', 'email', 'fullName', 'birthDate', 'gender', 'cpf', 'phone', 'address'];

// Converte erros comuns do Mongoose em respostas 400 legíveis
const respostaDeErro = (res, error, mensagem) => {
    console.error(mensagem + ':', error);
    if (error && error.code === 11000) {
        return res.status(400).json({ message: 'Usuário, e-mail ou CPF já cadastrado' });
    }
    if (error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    if (error && error.name === 'CastError') {
        return res.status(400).json({ message: 'Identificador inválido' });
    }
    return res.status(500).json({ message: mensagem });
};

// Cadastro de usuário
exports.register = async (req, res) => {
    const { username, email, password, confirmPassword, fullName, birthDate, gender, cpf, phone, address } = req.body;

    if (!password || password !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
    }
    if (!address || !address.cep || !address.numero) {
        return res.status(400).json({ message: 'Endereço incompleto ou ausente' });
    }
    const cep = String(address.cep).replace(/\D/g, '');
    if (cep.length !== 8) {
        return res.status(400).json({ message: 'CEP inválido ou ausente' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'E-mail já cadastrado' });
        }

        // Completa o endereço pelo ViaCEP
        const { data: viaCep } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (viaCep.erro) {
            return res.status(400).json({ message: 'CEP não encontrado' });
        }

        const user = new User({
            username,
            email,
            password, // o pre('save') do modelo faz o hash
            fullName,
            birthDate,
            gender,
            cpf,
            phone,
            address: {
                cep,
                logradouro: viaCep.logradouro,
                numero: address.numero,
                bairro: viaCep.bairro,
                cidade: viaCep.localidade,
                estado: viaCep.uf,
            },
        });

        await user.save();
        res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao cadastrar usuário');
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Informe e-mail e senha' });
    }

    try {
        const user = await User.findOne({ email });
        const senhaOk = user ? await user.comparePassword(password) : false;
        if (!user || !senhaOk) {
            // Mesma mensagem nos dois casos para não revelar quais e-mails existem
            return res.status(400).json({ message: 'E-mail ou senha incorretos' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao fazer login');
    }
};

// Listar usuários (sem o hash da senha)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao listar usuários');
    }
};

// Um usuário por id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao buscar usuário');
    }
};

// Atualizar um usuário (só os campos da lista; senha é ignorada)
exports.updateUser = async (req, res) => {
    const updates = {};
    for (const campo of CAMPOS_EDITAVEIS) {
        if (req.body[campo] !== undefined) {
            updates[campo] = req.body[campo];
        }
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao atualizar usuário');
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
        respostaDeErro(res, error, 'Erro ao excluir usuário');
    }
};

// Perfil do usuário logado (id vem do token, via authMiddleware)
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao buscar dados do usuário');
    }
};
