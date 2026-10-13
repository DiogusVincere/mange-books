const jwt = require('jsonwebtoken');

// Exige um token JWT válido no cabeçalho "Authorization: Bearer <token>" e
// deixa o id do usuário em req.userId para as rotas seguintes.
exports.authMiddleware = (req, res, next) => {
    const cabecalho = req.header('Authorization') || '';
    const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7).trim() : null;

    if (!token) {
        return res.status(401).json({ message: 'Acesso não autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};
