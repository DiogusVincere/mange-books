const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const { authMiddleware, authOpcional, somenteBibliotecario } = require('../middleware/auth');

const router = express.Router();

// ---- Upload de capa -------------------------------------------------------
// Pasta sempre relativa a este arquivo, não ao diretório de onde o node foi chamado.
const PASTA_UPLOADS = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(PASTA_UPLOADS, { recursive: true });
        cb(null, PASTA_UPLOADS);
    },
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${extensao}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
        const erro = new Error('Envie uma imagem JPG, PNG, WebP ou GIF');
        erro.status = 400;
        cb(erro);
    },
});

// Caminho gravado no banco: sempre com barra normal, mesmo no Windows.
const caminhoDaCapa = (file) => `uploads/${file.filename}`;
const ehUrl = (texto) => /^https?:\/\//i.test(String(texto || ''));

// Apaga a capa do disco quando é arquivo local. Capas por URL ficam.
const apagarCapa = (coverImage) => {
    if (!coverImage || ehUrl(coverImage)) return;
    fs.unlink(path.join(__dirname, '..', coverImage), (err) => {
        if (err && err.code !== 'ENOENT') console.error('Erro ao apagar a capa:', err);
    });
};

// ---- Validação ------------------------------------------------------------
const limparIsbn = (isbn) => String(isbn || '').replace(/[-\s]/g, '');
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Devolve {dados, erros}. Com parcial=true, só valida os campos enviados (edição).
function validarLivro(body, parcial = false) {
    const erros = {};
    const dados = {};
    const anoAtual = new Date().getFullYear();
    const texto = (campo, rotulo, maximo) => {
        if (body[campo] === undefined) {
            if (!parcial) erros[campo] = `Informe ${rotulo}`;
            return;
        }
        const valor = String(body[campo]).trim();
        if (!valor) erros[campo] = `Informe ${rotulo}`;
        else if (valor.length > maximo) erros[campo] = `${rotulo} deve ter até ${maximo} caracteres`;
        else dados[campo] = valor;
    };
    texto('title', 'o título', 200);
    texto('author', 'o autor', 150);
    texto('description', 'a descrição', 3000);

    if (body.year !== undefined || !parcial) {
        const ano = Number(body.year);
        if (!Number.isInteger(ano) || ano < 1400 || ano > anoAtual + 1) erros.year = `Ano deve estar entre 1400 e ${anoAtual + 1}`;
        else dados.year = ano;
    }
    if (body.genre !== undefined || !parcial) {
        if (!Book.GENEROS.includes(body.genre)) erros.genre = `Gênero deve ser um destes: ${Book.GENEROS.join(', ')}`;
        else dados.genre = body.genre;
    }
    if (body.pageCount !== undefined || !parcial) {
        const paginas = Number(body.pageCount);
        if (!Number.isInteger(paginas) || paginas < 1 || paginas > 20000) erros.pageCount = 'Número de páginas inválido';
        else dados.pageCount = paginas;
    }
    if (body.coverType !== undefined || !parcial) {
        if (!Book.TIPOS_CAPA.includes(body.coverType)) erros.coverType = 'Tipo de capa deve ser Dura ou Mole';
        else dados.coverType = body.coverType;
    }
    if (body.isbn !== undefined || !parcial) {
        const isbn = limparIsbn(body.isbn);
        if (!/^\d{10}$|^\d{13}$/.test(isbn)) erros.isbn = 'ISBN deve ter 10 ou 13 dígitos';
        else dados.isbn = isbn;
    }
    if (body.coverUrl !== undefined && String(body.coverUrl).trim()) {
        const url = String(body.coverUrl).trim();
        if (!ehUrl(url) || url.length > 500) erros.coverUrl = 'URL da capa inválida';
        else dados.coverUrl = url;
    }
    return { dados, erros };
}

const responderErroMongo = (res, error, mensagem) => {
    if (error && error.code === 11000) {
        return res.status(400).json({ message: 'Já existe um livro com esse ISBN', erros: { isbn: 'ISBN já cadastrado' } });
    }
    if (error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    if (error && error.name === 'CastError') {
        return res.status(400).json({ message: 'Identificador inválido' });
    }
    console.error(mensagem + ':', error);
    res.status(500).json({ message: mensagem });
};

// ---- Enriquecimento: nota média, total de avaliações e situação -----------
// Situação vem das reservas ativas: 'emprestado' > 'reservado' > 'disponivel'.
const ETAPAS_RESUMO = [
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'bookId', as: 'avaliacoes' } },
    {
        $lookup: {
            from: 'reservations',
            let: { id: '$_id' },
            pipeline: [
                { $match: { $expr: { $and: [{ $eq: ['$book', '$$id'] }, { $in: ['$status', Reservation.ATIVOS] }] } } },
                { $project: { status: 1, user: 1 } },
            ],
            as: 'reservasAtivas',
        },
    },
    {
        $addFields: {
            totalAvaliacoes: { $size: '$avaliacoes' },
            notaMedia: {
                $cond: [{ $gt: [{ $size: '$avaliacoes' }, 0] }, { $round: [{ $avg: '$avaliacoes.rating' }, 1] }, null],
            },
            situacao: {
                $switch: {
                    branches: [
                        { case: { $in: ['Emprestado', '$reservasAtivas.status'] }, then: 'emprestado' },
                        { case: { $in: ['Reservado', '$reservasAtivas.status'] }, then: 'reservado' },
                    ],
                    default: 'disponivel',
                },
            },
        },
    },
    { $project: { avaliacoes: 0 } },
];

const ORDENS = {
    recentes: { _id: -1 },
    titulo: { title: 1 },
    autor: { author: 1, title: 1 },
    ano: { year: -1, title: 1 },
    nota: { notaMedia: -1, totalAvaliacoes: -1, title: 1 },
};

// ---- Rotas ----------------------------------------------------------------

// Lista (pública). Filtros opcionais: ?genero=Fantasia&q=texto&ordem=titulo&limite=8
router.get('/', async (req, res) => {
    try {
        const filtro = {};
        if (req.query.genero && Book.GENEROS.includes(req.query.genero)) filtro.genre = req.query.genero;
        const q = String(req.query.q || '').trim();
        if (q) {
            const regex = new RegExp(escaparRegex(q), 'i');
            filtro.$or = [{ title: regex }, { author: regex }];
        }
        const ordem = ORDENS[req.query.ordem] || ORDENS.recentes;
        const etapas = [{ $match: filtro }, ...ETAPAS_RESUMO, { $project: { reservasAtivas: 0 } }, { $sort: ordem }];
        const limite = Number(req.query.limite);
        if (Number.isInteger(limite) && limite > 0) etapas.push({ $limit: Math.min(limite, 100) });
        const livros = await Book.aggregate(etapas).collation({ locale: 'pt', strength: 1 });
        res.status(200).json(livros);
    } catch (error) {
        responderErroMongo(res, error, 'Erro ao buscar livros');
    }
});

// Últimos adicionados (?limite=8, padrão 8)
router.get('/recent', async (req, res) => {
    try {
        const limite = Math.min(Number(req.query.limite) || 8, 50);
        const livros = await Book.aggregate([...ETAPAS_RESUMO, { $project: { reservasAtivas: 0 } }, { $sort: { _id: -1 } }, { $limit: limite }]);
        res.status(200).json(livros);
    } catch (error) {
        responderErroMongo(res, error, 'Erro ao buscar livros recentes');
    }
});

// Busca rápida do cabeçalho (?q=texto). Precisa vir antes de '/:id'.
router.get('/search', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(200).json({ books: [] });
    try {
        const regex = new RegExp(escaparRegex(q), 'i');
        const books = await Book.find({ $or: [{ title: regex }, { author: regex }] })
            .select('title author genre coverImage year')
            .sort({ title: 1 })
            .limit(8);
        res.status(200).json({ books });
    } catch (error) {
        responderErroMongo(res, error, 'Erro na busca de livros');
    }
});

// Um livro, com situação e (se logado) a reserva ativa do próprio usuário.
router.get('/:id', authOpcional, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Identificador inválido' });
    }
    try {
        const [livro] = await Book.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            ...ETAPAS_RESUMO,
        ]);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        const minha = req.userId
            ? (livro.reservasAtivas || []).find((r) => String(r.user) === String(req.userId))
            : null;
        delete livro.reservasAtivas;
        livro.minhaReserva = minha ? { _id: minha._id, status: minha.status } : null;
        res.status(200).json(livro);
    } catch (error) {
        responderErroMongo(res, error, 'Erro ao buscar livro');
    }
});

// Cadastrar (bibliotecário). Aceita multipart (campo coverImage) ou JSON com coverUrl.
router.post('/', authMiddleware, somenteBibliotecario, upload.single('coverImage'), async (req, res) => {
    const { dados, erros } = validarLivro(req.body);
    if (Object.keys(erros).length) {
        if (req.file) apagarCapa(caminhoDaCapa(req.file));
        return res.status(400).json({ message: 'Confira os campos destacados', erros });
    }
    try {
        const { coverUrl, ...campos } = dados;
        const livro = await Book.create({
            ...campos,
            coverImage: req.file ? caminhoDaCapa(req.file) : (coverUrl || null),
        });
        res.status(201).json(livro);
    } catch (error) {
        if (req.file) apagarCapa(caminhoDaCapa(req.file));
        responderErroMongo(res, error, 'Erro ao salvar livro');
    }
});

// Editar (bibliotecário). Só altera o que foi enviado; capa nova substitui a antiga.
router.put('/:id', authMiddleware, somenteBibliotecario, upload.single('coverImage'), async (req, res) => {
    const { dados, erros } = validarLivro(req.body, true);
    if (Object.keys(erros).length) {
        if (req.file) apagarCapa(caminhoDaCapa(req.file));
        return res.status(400).json({ message: 'Confira os campos destacados', erros });
    }
    try {
        const livro = await Book.findById(req.params.id);
        if (!livro) {
            if (req.file) apagarCapa(caminhoDaCapa(req.file));
            return res.status(404).json({ message: 'Livro não encontrado' });
        }
        const { coverUrl, ...campos } = dados;
        Object.assign(livro, campos);
        if (req.file) {
            apagarCapa(livro.coverImage);
            livro.coverImage = caminhoDaCapa(req.file);
        } else if (coverUrl) {
            apagarCapa(livro.coverImage);
            livro.coverImage = coverUrl;
        } else if (String(req.body.removerCapa) === 'true') {
            apagarCapa(livro.coverImage);
            livro.coverImage = null;
        }
        await livro.save();
        res.status(200).json(livro);
    } catch (error) {
        responderErroMongo(res, error, 'Erro ao atualizar livro');
    }
});

// Excluir (bibliotecário). Não exclui livro com reserva ou empréstimo em aberto.
router.delete('/:id', authMiddleware, somenteBibliotecario, async (req, res) => {
    try {
        const livro = await Book.findById(req.params.id);
        if (!livro) return res.status(404).json({ message: 'Livro não encontrado' });
        const ativa = await Reservation.exists({ book: livro._id, status: { $in: Reservation.ATIVOS } });
        if (ativa) {
            return res.status(400).json({ message: 'Este livro tem reserva ou empréstimo em aberto. Finalize antes de excluir.' });
        }
        apagarCapa(livro.coverImage);
        await Promise.all([
            Review.deleteMany({ bookId: livro._id }),
            Reservation.deleteMany({ book: livro._id }),
            livro.deleteOne(),
        ]);
        res.status(200).json({ message: 'Livro excluído' });
    } catch (error) {
        responderErroMongo(res, error, 'Erro ao excluir livro');
    }
});

module.exports = router;
