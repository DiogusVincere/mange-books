const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');

// Campos que o PUT /api/auth/:id pode alterar. A senha fica de fora de propósito:
// findByIdAndUpdate não passa pelo pre('save') que faz o hash. Troca de senha tem rota própria.
const CAMPOS_EDITAVEIS = ['username', 'email', 'fullName', 'birthDate', 'gender', 'cpf', 'phone', 'address'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DURACAO_TOKEN = '12h';

const soDigitos = (valor) => String(valor || '').replace(/\D/g, '');
const formatarTelefone = (digitos) => {
    if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    return digitos;
};

// Versão pública de um usuário (sem senha)
const publico = (usuario) => {
    const dados = usuario.toObject ? usuario.toObject() : { ...usuario };
    delete dados.password;
    delete dados.__v;
    return dados;
};
const resumo = (u) => ({ _id: u._id, username: u.username, fullName: u.fullName, email: u.email, role: u.role });

const respostaDeErro = (res, error, mensagem) => {
    if (error && error.code === 11000) {
        const campo = Object.keys(error.keyPattern || {})[0];
        const nomes = { email: 'E-mail', cpf: 'CPF', username: 'Apelido' };
        return res.status(400).json({
            message: `${nomes[campo] || 'Dado'} já cadastrado`,
            erros: campo ? { [campo]: `${nomes[campo] || 'Valor'} já cadastrado` } : undefined,
        });
    }
    if (error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    if (error && error.name === 'CastError') {
        return res.status(400).json({ message: 'Identificador inválido' });
    }
    console.error(mensagem + ':', error);
    return res.status(500).json({ message: mensagem });
};

// ---- Cadastro -------------------------------------------------------------
exports.register = async (req, res) => {
    const b = req.body || {};
    const endereco = b.address || {};
    const erros = {};

    const username = String(b.username || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const password = String(b.password || '');
    const fullName = String(b.fullName || '').trim().replace(/\s+/g, ' ');
    const cpf = soDigitos(b.cpf);
    const phone = soDigitos(b.phone);
    const cep = soDigitos(endereco.cep);
    const numero = String(endereco.numero || '').trim();
    const nascimento = new Date(b.birthDate);

    if (username.length < 3 || username.length > 30) erros.username = 'O apelido deve ter de 3 a 30 caracteres';
    if (!EMAIL.test(email)) erros.email = 'E-mail inválido';
    if (password.length < 6) erros.password = 'A senha deve ter pelo menos 6 caracteres';
    if (password !== String(b.confirmPassword || '')) erros.confirmPassword = 'As senhas não coincidem';
    if (fullName.length < 3) erros.fullName = 'Informe o nome completo';
    if (!b.birthDate || isNaN(nascimento) || nascimento > new Date()) erros.birthDate = 'Data de nascimento inválida';
    if (!['Masculino', 'Feminino', 'Outro'].includes(b.gender)) erros.gender = 'Selecione o gênero';
    if (cpf.length !== 11) erros.cpf = 'O CPF deve ter 11 dígitos';
    if (phone.length < 10 || phone.length > 11) erros.phone = 'Informe o telefone com DDD';
    if (cep.length !== 8) erros.cep = 'O CEP deve ter 8 dígitos';
    if (!numero) erros.numero = 'Informe o número';
    if (Object.keys(erros).length) {
        return res.status(400).json({ message: 'Confira os campos destacados', erros });
    }

    try {
        if (await User.exists({ email })) return res.status(400).json({ message: 'E-mail já cadastrado', erros: { email: 'E-mail já cadastrado' } });
        if (await User.exists({ cpf })) return res.status(400).json({ message: 'CPF já cadastrado', erros: { cpf: 'CPF já cadastrado' } });
        if (await User.exists({ username })) return res.status(400).json({ message: 'Apelido já em uso', erros: { username: 'Apelido já em uso' } });

        // Completa o endereço pelo ViaCEP; se o serviço estiver fora, aceita o que o front mandou.
        let viaCep = {};
        try {
            const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 8000 });
            viaCep = resposta.data || {};
        } catch (error) {
            viaCep = {};
        }
        if (viaCep.erro) {
            return res.status(400).json({ message: 'CEP não encontrado', erros: { cep: 'CEP não encontrado' } });
        }

        const usuario = await new User({
            username,
            email,
            password, // o pre('save') do modelo faz o hash
            fullName,
            birthDate: nascimento,
            gender: b.gender,
            cpf,
            phone: formatarTelefone(phone),
            role: 'leitor', // nunca vem do cadastro
            address: {
                cep,
                numero,
                logradouro: viaCep.logradouro || String(endereco.logradouro || '').trim(),
                bairro: viaCep.bairro || String(endereco.bairro || '').trim(),
                cidade: viaCep.localidade || String(endereco.cidade || '').trim(),
                estado: viaCep.uf || String(endereco.estado || '').trim(),
            },
        }).save();

        res.status(201).json({ message: 'Cadastro realizado! Agora é só entrar.', usuario: resumo(usuario) });
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao cadastrar usuário');
    }
};

// ---- Login ----------------------------------------------------------------
exports.login = async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
        return res.status(400).json({ message: 'Informe e-mail e senha' });
    }
    try {
        const usuario = await User.findOne({ email });
        const senhaOk = usuario ? await usuario.comparePassword(password) : false;
        if (!usuario || !senhaOk) {
            // Mesma mensagem nos dois casos para não revelar quais e-mails existem
            return res.status(400).json({ message: 'E-mail ou senha incorretos' });
        }
        const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, { expiresIn: DURACAO_TOKEN });
        res.status(200).json({ message: 'Login bem-sucedido', token, usuario: resumo(usuario) });
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao fazer login');
    }
};

// ---- Perfil do logado -----------------------------------------------------
exports.getUserProfile = async (req, res) => {
    try {
        const usuario = await User.findById(req.userId).select('-password');
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json(publico(usuario));
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao buscar dados do usuário');
    }
};

exports.trocarSenha = async (req, res) => {
    const senhaAtual = String(req.body.senhaAtual || '');
    const novaSenha = String(req.body.novaSenha || '');
    if (novaSenha.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
    }
    try {
        const usuario = await User.findById(req.userId);
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
        if (!(await usuario.comparePassword(senhaAtual))) {
            return res.status(400).json({ message: 'Senha atual incorreta' });
        }
        usuario.password = novaSenha; // pre('save') faz o hash
        await usuario.save();
        res.status(200).json({ message: 'Senha alterada' });
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao trocar a senha');
    }
};

// ---- Usuários (bibliotecário, ou o próprio para ver/editar os seus dados) ---
exports.getAllUsers = async (req, res) => {
    try {
        const usuarios = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(usuarios);
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao listar usuários');
    }
};

const podeMexer = (req) => req.papel === 'bibliotecario' || String(req.params.id) === String(req.userId);

exports.getUserById = async (req, res) => {
    if (!podeMexer(req)) return res.status(403).json({ message: 'Você só pode ver os seus próprios dados' });
    try {
        const usuario = await User.findById(req.params.id).select('-password');
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json(publico(usuario));
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao buscar usuário');
    }
};

exports.updateUser = async (req, res) => {
    if (!podeMexer(req)) return res.status(403).json({ message: 'Você só pode alterar os seus próprios dados' });
    const updates = {};
    const erros = {};
    for (const campo of CAMPOS_EDITAVEIS) {
        if (req.body[campo] !== undefined) updates[campo] = req.body[campo];
    }
    if (updates.email !== undefined) {
        updates.email = String(updates.email).trim().toLowerCase();
        if (!EMAIL.test(updates.email)) erros.email = 'E-mail inválido';
    }
    if (updates.cpf !== undefined) {
        updates.cpf = soDigitos(updates.cpf);
        if (updates.cpf.length !== 11) erros.cpf = 'O CPF deve ter 11 dígitos';
    }
    if (updates.phone !== undefined) {
        const digitos = soDigitos(updates.phone);
        if (digitos.length < 10 || digitos.length > 11) erros.phone = 'Informe o telefone com DDD';
        else updates.phone = formatarTelefone(digitos);
    }
    if (updates.fullName !== undefined && String(updates.fullName).trim().length < 3) erros.fullName = 'Informe o nome completo';
    if (updates.username !== undefined && !/^.{3,30}$/.test(String(updates.username).trim())) erros.username = 'O apelido deve ter de 3 a 30 caracteres';
    if (updates.address !== undefined) {
        const atual = {};
        for (const chave of ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado']) {
            if (updates.address[chave] !== undefined) atual[`address.${chave}`] = String(updates.address[chave]).trim();
        }
        if (atual['address.cep'] !== undefined) {
            atual['address.cep'] = soDigitos(atual['address.cep']);
            if (atual['address.cep'].length !== 8) erros.cep = 'O CEP deve ter 8 dígitos';
        }
        delete updates.address;
        Object.assign(updates, atual);
    }
    // Papel: só bibliotecário muda, e nunca o próprio
    if (req.body.role !== undefined) {
        if (req.papel !== 'bibliotecario') return res.status(403).json({ message: 'Só bibliotecários alteram papéis' });
        if (String(req.params.id) === String(req.userId)) return res.status(400).json({ message: 'Você não pode alterar o seu próprio papel' });
        if (!User.PAPEIS.includes(req.body.role)) erros.role = 'Papel inválido';
        else updates.role = req.body.role;
    }
    if (Object.keys(erros).length) {
        return res.status(400).json({ message: 'Confira os campos destacados', erros });
    }
    try {
        const usuario = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).select('-password');
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.status(200).json(publico(usuario));
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao atualizar usuário');
    }
};

exports.deleteUser = async (req, res) => {
    if (String(req.params.id) === String(req.userId)) {
        return res.status(400).json({ message: 'Você não pode excluir a sua própria conta por aqui' });
    }
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
        const emAberto = await Reservation.exists({ user: usuario._id, status: { $in: Reservation.ATIVOS } });
        if (emAberto) {
            return res.status(400).json({ message: 'Este leitor tem reserva ou empréstimo em aberto. Finalize antes de excluir.' });
        }
        await Promise.all([
            Review.deleteMany({ userId: usuario._id }),
            Reservation.deleteMany({ user: usuario._id }),
            usuario.deleteOne(),
        ]);
        res.status(200).json({ message: 'Usuário excluído' });
    } catch (error) {
        respostaDeErro(res, error, 'Erro ao excluir usuário');
    }
};
