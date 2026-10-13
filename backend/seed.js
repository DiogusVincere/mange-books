// Popula o banco com um usuário de demonstração e seis livros de exemplo.
// Uso: npm run seed   (precisa de MONGO_URI no backend/.env)
// Pode rodar quantas vezes quiser: o que já existe (mesmo e-mail / mesmo ISBN) é pulado.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Book = require('./models/Book');

// Conta pública de demonstração (está no README de propósito).
const USUARIO_DEMO = {
    username: 'demo',
    email: 'demo@demo.com',
    password: 'demo1234', // o pre('save') do modelo faz o hash
    fullName: 'Usuário de Demonstração',
    birthDate: new Date('2000-01-01'),
    gender: 'Outro',
    cpf: '00000000000',
    phone: '(19) 99999-9999',
    address: {
        cep: '13036210',
        logradouro: 'Rua Pastor Cícero Canuto de Lima',
        numero: '71',
        bairro: 'São Bernardo',
        cidade: 'Campinas',
        estado: 'SP',
    },
};

// Capa pela Open Library, a partir do ISBN (sem token, sem upload).
const capa = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

// Um livro por gênero do enum do modelo: Fantasia, Terror, Drama, Suspense, Ação, Ficção.
const LIVROS = [
    {
        title: 'O Hobbit',
        author: 'J. R. R. Tolkien',
        description: 'Bilbo Bolseiro é arrancado de sua vida tranquila para uma jornada com treze anões e o mago Gandalf em busca do tesouro guardado pelo dragão Smaug.',
        year: 1937,
        genre: 'Fantasia',
        pageCount: 310,
        coverType: 'Mole',
        isbn: '9780345339683',
    },
    {
        title: 'Drácula',
        author: 'Bram Stoker',
        description: 'O advogado Jonathan Harker viaja à Transilvânia a negócios com o conde Drácula e descobre a verdadeira natureza do anfitrião. O romance que fixou o vampiro moderno.',
        year: 1897,
        genre: 'Terror',
        pageCount: 418,
        coverType: 'Mole',
        isbn: '9780141439846',
    },
    {
        title: 'O Sol é para Todos',
        author: 'Harper Lee',
        description: 'No Alabama dos anos 1930, a menina Scout acompanha o pai, o advogado Atticus Finch, na defesa de um homem negro acusado injustamente.',
        year: 1960,
        genre: 'Drama',
        pageCount: 336,
        coverType: 'Mole',
        isbn: '9780061120084',
    },
    {
        title: 'E Não Sobrou Nenhum',
        author: 'Agatha Christie',
        description: 'Dez desconhecidos são atraídos a uma ilha isolada e começam a morrer um a um, seguindo a letra de uma cantiga infantil.',
        year: 1939,
        genre: 'Suspense',
        pageCount: 264,
        coverType: 'Mole',
        isbn: '9780062073488',
    },
    {
        title: 'Jogos Vorazes',
        author: 'Suzanne Collins',
        description: 'Katniss Everdeen se oferece no lugar da irmã para disputar os Jogos Vorazes, uma competição mortal transmitida para toda a nação de Panem.',
        year: 2008,
        genre: 'Ação',
        pageCount: 374,
        coverType: 'Dura',
        isbn: '9780439023481',
    },
    {
        title: '1984',
        author: 'George Orwell',
        description: 'Winston Smith trabalha reescrevendo a história para o Partido, sob o olhar constante do Grande Irmão, até começar a questionar o regime.',
        year: 1949,
        genre: 'Ficção',
        pageCount: 328,
        coverType: 'Mole',
        isbn: '9780451524935',
    },
];

async function main() {
    if (!process.env.MONGO_URI) {
        console.error('Defina MONGO_URI no backend/.env antes de rodar o seed.');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB.');

    // Usuário de demonstração
    const usuarioExistente = await User.findOne({ email: USUARIO_DEMO.email });
    if (usuarioExistente) {
        console.log(`Usuário ${USUARIO_DEMO.email} já existia.`);
    } else {
        await new User(USUARIO_DEMO).save();
        console.log(`Usuário ${USUARIO_DEMO.email} criado (senha: ${USUARIO_DEMO.password}).`);
    }

    // Livros
    let criados = 0;
    for (const livro of LIVROS) {
        const existente = await Book.findOne({ isbn: livro.isbn });
        if (existente) {
            console.log(`Livro "${livro.title}" já existia.`);
            continue;
        }
        await Book.create({ ...livro, coverImage: capa(livro.isbn) });
        criados += 1;
        console.log(`Livro "${livro.title}" criado.`);
    }

    console.log(`Pronto: ${criados} livro(s) novo(s).`);
}

main()
    .catch((error) => {
        console.error('Erro no seed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
