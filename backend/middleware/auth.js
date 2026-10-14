const jwt = require('jsonwebtoken');
const User = require('../models/user');

const extrairToken = (req) => {
    const cabecalho = req.header('Authorization') || '';
    return cabecalho.startsWith('Bearer ') ? cabecalho.slice(7).trim() : null;
};

// Exige token válido; deixa o id em req.userId.
exports.authMiddleware = (req, res, next) => {
    const token = extrairToken(req);
    if (!token) {
        return res.status(401).json({ message: 'Faça login para continuar' });
    }
    try {
        req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Sessão inválida ou expirada' });
    }
};

// Token opcional: se vier e for válido, preenche req.userId; nunca bloqueia.
exports.authOpcional = (req, res, next) => {
    const token = extrairToken(req);
    if (token) {
        try {
            req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
        } catch (error) {
            // token velho: segue como visitante
        }
    }
    next();
};

// Carrega o papel do usuário logado em req.papel (depois de authMiddleware).
exports.comPapel = async (req, res, next) => {
    try {
        const usuario = await User.findById(req.userId).select('role');
        if (!usuario) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        req.papel = usuario.role;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao verificar permissões' });
    }
};

// Só bibliotecários passam (depois de authMiddleware).
exports.somenteBibliotecario = [exports.comPapel, (req, res, next) => {
    if (req.papel !== 'bibliotecario') {
        return res.status(403).json({ message: 'Ação permitida apenas para bibliotecários' });
    }
    next();
}];
