// Popula o banco com dados de demonstração: duas contas públicas, três leitores
// fictícios, 36 livros (seis por gênero), avaliações e algumas reservas.
// Uso: npm run seed (precisa de MONGO_URI no backend/.env). O server.js também chama
// seed() sozinho quando sobe em modo demonstração (sem MONGO_URI).
// Pode rodar quantas vezes quiser: usuários e livros que já existem são pulados;
// avaliações e reservas só entram quando as coleções estão vazias.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Book = require('./models/Book');
const Review = require('./models/Review');
const Reservation = require('./models/Reservation');

const ENDERECO = { cep: '13010000', logradouro: 'Rua das Acácias', numero: '120', bairro: 'Centro', cidade: 'Campinas', estado: 'SP' };

// Contas públicas de demonstração (estão no README de propósito).
const USUARIO_DEMO = {
    username: 'demo',
    email: 'demo@demo.com',
    password: 'demo1234', // o pre('save') do modelo faz o hash
    fullName: 'Bibliotecária Demo',
    birthDate: new Date('1990-05-12'),
    gender: 'Feminino',
    cpf: '00000000000',
    phone: '(19) 99999-0001',
    role: 'bibliotecario',
    address: ENDERECO,
};
const USUARIO_LEITOR = {
    username: 'leitor',
    email: 'leitor@demo.com',
    password: 'demo1234',
    fullName: 'Leitor Demo',
    birthDate: new Date('1998-09-23'),
    gender: 'Outro',
    cpf: '00000000001',
    phone: '(19) 99999-0002',
    role: 'leitor',
    address: ENDERECO,
};
// Leitores fictícios, só para as avaliações e reservas terem nomes variados.
const LEITORES = {
    ana: { username: 'ana', email: 'ana@exemplo.com', password: 'demo1234', fullName: 'Ana Souza', birthDate: new Date('1995-02-14'), gender: 'Feminino', cpf: '11111111111', phone: '(19) 98888-1111', address: { ...ENDERECO, numero: '45' } },
    bruno: { username: 'bruno', email: 'bruno@exemplo.com', password: 'demo1234', fullName: 'Bruno Martins', birthDate: new Date('1988-11-30'), gender: 'Masculino', cpf: '22222222222', phone: '(19) 98888-2222', address: { ...ENDERECO, numero: '310' } },
    carla: { username: 'carla', email: 'carla@exemplo.com', password: 'demo1234', fullName: 'Carla Dias', birthDate: new Date('2001-07-08'), gender: 'Feminino', cpf: '33333333333', phone: '(19) 98888-3333', address: { ...ENDERECO, numero: '8' } },
};

// Capa grande pela Open Library, a partir do ISBN (sem token, sem upload).
const capa = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

// Seis livros por gênero do enum do modelo. Os ISBNs são de edições que têm capa na Open Library.
const LIVROS = [
    // Fantasia
    { title: 'O Hobbit', author: 'J. R. R. Tolkien', year: 1937, genre: 'Fantasia', pageCount: 310, coverType: 'Mole', isbn: '9780345339683',
        description: 'Bilbo Bolseiro é arrancado de sua vida tranquila para uma jornada com treze anões e o mago Gandalf em busca do tesouro guardado pelo dragão Smaug.' },
    { title: 'A Sociedade do Anel', author: 'J. R. R. Tolkien', year: 1954, genre: 'Fantasia', pageCount: 423, coverType: 'Mole', isbn: '9780547928210',
        description: 'Frodo herda o Um Anel e parte do Condado com a Sociedade para destruí-lo em Mordor, antes que Sauron o recupere.' },
    { title: 'Harry Potter e a Pedra Filosofal', author: 'J. K. Rowling', year: 1997, genre: 'Fantasia', pageCount: 309, coverType: 'Dura', isbn: '9780590353427',
        description: 'No dia em que faz onze anos, Harry descobre que é bruxo e vai estudar em Hogwarts, onde encontra amigos, um esporte voador e o segredo guardado no terceiro andar.' },
    { title: 'O Leão, a Feiticeira e o Guarda-Roupa', author: 'C. S. Lewis', year: 1950, genre: 'Fantasia', pageCount: 206, coverType: 'Mole', isbn: '9780064404990',
        description: 'Quatro irmãos atravessam um guarda-roupa e chegam a Nárnia, um reino preso num inverno sem Natal pela Feiticeira Branca.' },
    { title: 'O Nome do Vento', author: 'Patrick Rothfuss', year: 2007, genre: 'Fantasia', pageCount: 662, coverType: 'Mole', isbn: '9780756404741',
        description: 'Kvothe, lenda viva escondida como estalajadeiro, conta a própria história: da infância entre artistas itinerantes à Universidade, onde busca o nome do vento.' },
    { title: 'A Guerra dos Tronos', author: 'George R. R. Martin', year: 1996, genre: 'Fantasia', pageCount: 835, coverType: 'Mole', isbn: '9780553593716',
        description: 'Nos Sete Reinos, famílias nobres disputam o Trono de Ferro enquanto, além da Muralha, um perigo antigo desperta com o inverno que se aproxima.' },
    // Terror
    { title: 'Drácula', author: 'Bram Stoker', year: 1897, genre: 'Terror', pageCount: 418, coverType: 'Mole', isbn: '9780393970128',
        description: 'O advogado Jonathan Harker viaja à Transilvânia a negócios com o conde Drácula e descobre a verdadeira natureza do anfitrião. O romance que fixou o vampiro moderno.' },
    { title: 'Frankenstein', author: 'Mary Shelley', year: 1818, genre: 'Terror', pageCount: 273, coverType: 'Mole', isbn: '9780141439471',
        description: 'Victor Frankenstein dá vida a uma criatura e a abandona; rejeitada por todos, ela volta para cobrar do criador a responsabilidade pelo que fez.' },
    { title: 'O Iluminado', author: 'Stephen King', year: 1977, genre: 'Terror', pageCount: 447, coverType: 'Mole', isbn: '9780307743657',
        description: 'Jack Torrance aceita cuidar do Hotel Overlook durante o inverno, isolado com a mulher e o filho Danny, que enxerga o que o hotel esconde.' },
    { title: 'It: A Coisa', author: 'Stephen King', year: 1986, genre: 'Terror', pageCount: 1138, coverType: 'Dura', isbn: '9781501142970',
        description: 'Sete amigos de Derry enfrentam na infância uma entidade que assume a forma do medo de cada um e, 27 anos depois, voltam para cumprir a promessa de acabar com ela.' },
    { title: 'O Exorcista', author: 'William Peter Blatty', year: 1971, genre: 'Terror', pageCount: 340, coverType: 'Mole', isbn: '9780061007224',
        description: 'Quando a filha de uma atriz passa a ter crises que a medicina não explica, dois padres são chamados para um rito que vai testar a fé de ambos.' },
    { title: 'Carrie', author: 'Stephen King', year: 1974, genre: 'Terror', pageCount: 199, coverType: 'Mole', isbn: '9780307743664',
        description: 'Humilhada na escola e sufocada em casa por uma mãe fanática, Carrie White descobre que tem poderes telecinéticos, e o baile de formatura nunca mais será o mesmo.' },
    // Drama
    { title: 'O Sol é para Todos', author: 'Harper Lee', year: 1960, genre: 'Drama', pageCount: 336, coverType: 'Mole', isbn: '9780061120084',
        description: 'No Alabama dos anos 1930, a menina Scout acompanha o pai, o advogado Atticus Finch, na defesa de um homem negro acusado injustamente.' },
    { title: 'O Grande Gatsby', author: 'F. Scott Fitzgerald', year: 1925, genre: 'Drama', pageCount: 180, coverType: 'Mole', isbn: '9780743273565',
        description: 'Nick Carraway se muda para Long Island e conhece Jay Gatsby, o vizinho milionário que dá festas enormes à espera de um amor do passado.' },
    { title: 'A Menina que Roubava Livros', author: 'Markus Zusak', year: 2005, genre: 'Drama', pageCount: 552, coverType: 'Mole', isbn: '9780375842207',
        description: 'Na Alemanha nazista, Liesel aprende a ler com o pai adotivo e passa a roubar livros, enquanto a família esconde um judeu no porão. Narrado pela Morte.' },
    { title: 'O Caçador de Pipas', author: 'Khaled Hosseini', year: 2003, genre: 'Drama', pageCount: 371, coverType: 'Mole', isbn: '9781594631931',
        description: 'Amir cresce em Cabul ao lado de Hassan, filho do empregado da casa, até que um ato de covardia separa os dois e o persegue pelo resto da vida.' },
    { title: 'Dom Casmurro', author: 'Machado de Assis', year: 1899, genre: 'Drama', pageCount: 256, coverType: 'Mole', isbn: '9780195103090',
        description: 'Bentinho relembra a vida com Capitu e tenta provar ao leitor que foi traído, num relato em que o narrador é o menos confiável dos personagens.' },
    { title: 'A Culpa é das Estrelas', author: 'John Green', year: 2012, genre: 'Drama', pageCount: 313, coverType: 'Dura', isbn: '9780525478812',
        description: 'Hazel, que vive com um câncer terminal, conhece Augustus num grupo de apoio, e os dois partem atrás do autor do livro favorito dela.' },
    // Suspense
    { title: 'E Não Sobrou Nenhum', author: 'Agatha Christie', year: 1939, genre: 'Suspense', pageCount: 264, coverType: 'Mole', isbn: '9780062073488',
        description: 'Dez desconhecidos são atraídos a uma ilha isolada e começam a morrer um a um, seguindo a letra de uma cantiga infantil.' },
    { title: 'Garota Exemplar', author: 'Gillian Flynn', year: 2012, genre: 'Suspense', pageCount: 415, coverType: 'Mole', isbn: '9780307588371',
        description: 'No quinto aniversário de casamento, Amy desaparece e todas as pistas apontam para o marido. O diário dela e a versão dele contam histórias que não batem.' },
    { title: 'O Código Da Vinci', author: 'Dan Brown', year: 2003, genre: 'Suspense', pageCount: 489, coverType: 'Mole', isbn: '9780307474278',
        description: 'O simbologista Robert Langdon é chamado ao Louvre depois de um assassinato e segue uma trilha de enigmas escondidos em obras de arte.' },
    { title: 'O Silêncio dos Inocentes', author: 'Thomas Harris', year: 1988, genre: 'Suspense', pageCount: 338, coverType: 'Mole', isbn: '9780312924584',
        description: 'A agente em treinamento Clarice Starling procura a ajuda do dr. Hannibal Lecter para capturar um serial killer, e paga com as próprias memórias.' },
    { title: 'A Garota no Trem', author: 'Paula Hawkins', year: 2015, genre: 'Suspense', pageCount: 316, coverType: 'Mole', isbn: '9781594634024',
        description: 'Rachel observa todo dia, da janela do trem, um casal que parece perfeito, até que a mulher some e ela percebe que viu algo que não devia.' },
    { title: 'Assassinato no Expresso do Oriente', author: 'Agatha Christie', year: 1934, genre: 'Suspense', pageCount: 274, coverType: 'Mole', isbn: '9780062693662',
        description: 'Um passageiro é morto num trem parado pela neve, e Hercule Poirot tem um vagão inteiro de suspeitos com álibis bons demais.' },
    // Ação
    { title: 'Jogos Vorazes', author: 'Suzanne Collins', year: 2008, genre: 'Ação', pageCount: 374, coverType: 'Dura', isbn: '9780439023481',
        description: 'Katniss Everdeen se oferece no lugar da irmã para disputar os Jogos Vorazes, uma competição mortal transmitida para toda a nação de Panem.' },
    { title: 'Em Chamas', author: 'Suzanne Collins', year: 2009, genre: 'Ação', pageCount: 391, coverType: 'Dura', isbn: '9780439023498',
        description: 'Depois da vitória, Katniss vira símbolo de uma rebelião que não escolheu, e a Capital responde com um Massacre Quaternário especial.' },
    { title: 'Jurassic Park', author: 'Michael Crichton', year: 1990, genre: 'Ação', pageCount: 399, coverType: 'Mole', isbn: '9780345538987',
        description: 'Um bilionário recria dinossauros a partir de DNA fóssil e convida especialistas para avaliar o parque. Os sistemas falham na primeira noite.' },
    { title: 'O Ladrão de Raios', author: 'Rick Riordan', year: 2005, genre: 'Ação', pageCount: 377, coverType: 'Mole', isbn: '9780786838653',
        description: 'Percy Jackson descobre que é filho de Poseidon e tem dez dias para recuperar o raio-mestre de Zeus antes que os deuses entrem em guerra.' },
    { title: 'Divergente', author: 'Veronica Roth', year: 2011, genre: 'Ação', pageCount: 487, coverType: 'Mole', isbn: '9780062387240',
        description: 'Numa Chicago dividida em facções, Tris escolhe a Audácia e descobre que ser divergente é um segredo que pode custar a vida.' },
    { title: 'Perdido em Marte', author: 'Andy Weir', year: 2011, genre: 'Ação', pageCount: 369, coverType: 'Mole', isbn: '9780553418026',
        description: 'Deixado para trás em Marte e dado como morto, o astronauta Mark Watney precisa fazer comida, água e contato com a Terra com o que sobrou da missão.' },
    // Ficção
    { title: '1984', author: 'George Orwell', year: 1949, genre: 'Ficção', pageCount: 328, coverType: 'Mole', isbn: '9780451524935',
        description: 'Winston Smith trabalha reescrevendo a história para o Partido, sob o olhar constante do Grande Irmão, até começar a questionar o regime.' },
    { title: 'Admirável Mundo Novo', author: 'Aldous Huxley', year: 1932, genre: 'Ficção', pageCount: 268, coverType: 'Mole', isbn: '9780060850524',
        description: 'Numa sociedade em que as pessoas nascem em laboratório, são condicionadas para a própria casta e anestesiadas com soma, Bernard Marx começa a sentir falta de algo.' },
    { title: 'Fahrenheit 451', author: 'Ray Bradbury', year: 1953, genre: 'Ficção', pageCount: 249, coverType: 'Mole', isbn: '9781451673319',
        description: 'Montag é bombeiro num futuro em que bombeiros queimam livros. Uma vizinha curiosa o faz abrir um dos volumes que deveria destruir.' },
    { title: 'O Conto da Aia', author: 'Margaret Atwood', year: 1985, genre: 'Ficção', pageCount: 311, coverType: 'Mole', isbn: '9780385490818',
        description: 'Em Gilead, Offred é uma Aia, destinada a gerar filhos para a elite. Ela narra a rotina, a vigilância e as lembranças da vida de antes.' },
    { title: 'Duna', author: 'Frank Herbert', year: 1965, genre: 'Ficção', pageCount: 688, coverType: 'Mole', isbn: '9780441013593',
        description: 'Paul Atreides se muda com a família para Arrakis, o planeta deserto que produz a especiaria mais valiosa do universo, e cai numa armadilha política.' },
    { title: 'O Guia do Mochileiro das Galáxias', author: 'Douglas Adams', year: 1979, genre: 'Ficção', pageCount: 216, coverType: 'Mole', isbn: '9780345391803',
        description: 'Segundos antes de a Terra ser demolida para dar lugar a uma via expressa, Arthur Dent é resgatado por um amigo que, afinal, era alienígena.' },
];

// [leitor, isbn, nota, comentário]
const AVALIACOES = [
    ['ana', '9780345339683', 5, 'Releitura obrigatória. Leve, divertido e com um dragão que rouba a cena.'],
    ['bruno', '9780345339683', 4, 'Começa devagar, mas depois da Floresta das Trevas não dá para largar.'],
    ['carla', '9780547928210', 5, 'O início de tudo. A chegada a Valfenda ainda me arrepia.'],
    ['leitor', '9780590353427', 5, 'Li pela primeira vez aos dez anos e funciona do mesmo jeito hoje.'],
    ['ana', '9780756404741', 5, 'A prosa mais bonita que li em fantasia. Pena a continuação demorar tanto.'],
    ['bruno', '9780553593716', 4, 'Muitos personagens para acompanhar, mas vale cada capítulo.'],
    ['carla', '9780393970128', 4, 'O formato de cartas e diários dá um tom de documento que assusta mais.'],
    ['bruno', '9780307743657', 5, 'Bem diferente do filme e, para mim, melhor: o hotel é o vilão.'],
    ['leitor', '9781501142970', 3, 'Enorme. Tem trechos geniais e outros que eu teria cortado.'],
    ['ana', '9780307743664', 4, 'Curto e cruel. Dá para ler numa tarde e ficar pensando por dias.'],
    ['carla', '9780061120084', 5, 'Atticus Finch é o pai que todo mundo queria ter.'],
    ['bruno', '9780743273565', 4, 'Final melancólico e certeiro. Releio o último parágrafo sempre.'],
    ['leitor', '9780375842207', 5, 'Chorei. A Morte como narradora é uma das melhores ideias da literatura recente.'],
    ['ana', '9781594631931', 4, 'Dói de ler em alguns momentos, mas é impossível parar.'],
    ['carla', '9780195103090', 5, 'Traiu ou não traiu? Machado deixa a dúvida com o leitor, e é isso que faz o livro.'],
    ['bruno', '9780062073488', 5, 'O melhor mistério da Christie. Não dá para adivinhar.'],
    ['ana', '9780307588371', 4, 'A virada do meio do livro é uma das melhores que já li.'],
    ['leitor', '9780307474278', 3, 'Divertido, ritmo de filme. Não espere mais que isso.'],
    ['carla', '9780312924584', 5, 'Clarice e Lecter: cada conversa entre os dois é um duelo.'],
    ['bruno', '9780439023481', 4, 'Rápido e tenso. A arena é descrita de um jeito que você vê.'],
    ['ana', '9780345538987', 5, 'Mais científico e mais sombrio que o filme. Malcolm é ótimo.'],
    ['leitor', '9780553418026', 5, 'Engraçado, tenso e cheio de ciência de verdade. Meu favorito do ano.'],
    ['carla', '9780451524935', 5, 'Cada vez mais atual. O apêndice sobre a Novilíngua é assustador.'],
    ['bruno', '9780060850524', 4, 'O contraponto perfeito de 1984: controle pelo prazer, não pelo medo.'],
    ['ana', '9781451673319', 4, 'Curto, poético, com um final que respira esperança.'],
    ['leitor', '9780441013593', 4, 'Denso no começo, mas depois vira um dos melhores universos da ficção.'],
    ['carla', '9780345391803', 5, '42. Não precisa dizer mais nada.'],
    ['bruno', '9780385490818', 4, 'Perturbador justamente porque tudo ali já aconteceu em algum lugar.'],
];

// [leitor, isbn, status, dias atrás: reservado, emprestado, devolvido/cancelado]
const RESERVAS = [
    ['ana', '9780547928210', 'Emprestado', 7, 5, null],
    ['bruno', '9780307588371', 'Reservado', 1, null, null],
    ['carla', '9780307743657', 'Devolvido', 25, 23, 9],
    ['leitor', '9780441013593', 'Reservado', 0, null, null],
    ['ana', '9780451524935', 'Devolvido', 60, 58, 40],
    ['bruno', '9780345339683', 'Devolvido', 45, 44, 30],
    ['carla', '9780061120084', 'Emprestado', 4, 3, null],
    ['leitor', '9780062073488', 'Devolvido', 30, 29, 15],
    ['bruno', '9780553418026', 'Cancelado', 12, null, 11],
    ['ana', '9780307474278', 'Devolvido', 90, 89, 70],
];

const diasAtras = (dias) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

// Popula o banco já conectado (quem chama é responsável pelo mongoose.connect).
async function main({ silencioso = false } = {}) {
    const log = silencioso ? () => {} : console.log;

    // Usuários
    const usuarios = {};
    for (const [chave, dados] of Object.entries({ demo: USUARIO_DEMO, leitor: USUARIO_LEITOR, ...LEITORES })) {
        let usuario = await User.findOne({ email: dados.email });
        if (!usuario) {
            usuario = await new User(dados).save();
            log(`Usuário ${dados.email} criado.`);
        }
        usuarios[chave] = usuario;
    }

    // Livros
    const livros = {};
    let criados = 0;
    for (const livro of LIVROS) {
        let existente = await Book.findOne({ isbn: livro.isbn });
        if (!existente) {
            existente = await Book.create({ ...livro, coverImage: capa(livro.isbn) });
            criados += 1;
        }
        livros[livro.isbn] = existente;
    }
    log(`Livros: ${criados} novo(s), ${LIVROS.length - criados} já existia(m).`);

    // Avaliações (só na primeira vez)
    if ((await Review.countDocuments()) === 0) {
        const docs = AVALIACOES.map(([leitor, isbn, rating, comment], i) => ({
            bookId: livros[isbn]._id,
            userId: usuarios[leitor]._id,
            userName: usuarios[leitor].fullName,
            rating,
            comment,
            createdAt: diasAtras(AVALIACOES.length - i + 2),
            updatedAt: diasAtras(AVALIACOES.length - i + 2),
        }));
        await Review.insertMany(docs);
        log(`${docs.length} avaliações criadas.`);
    }

    // Reservas (só na primeira vez)
    if ((await Reservation.countDocuments()) === 0) {
        const docs = RESERVAS.map(([leitor, isbn, status, r, e, d]) => ({
            book: livros[isbn]._id,
            user: usuarios[leitor]._id,
            status,
            reservedAt: diasAtras(r),
            loanedAt: e === null ? undefined : diasAtras(e),
            returnedAt: status === 'Devolvido' ? diasAtras(d) : undefined,
            canceledAt: status === 'Cancelado' ? diasAtras(d) : undefined,
        }));
        await Reservation.insertMany(docs);
        log(`${docs.length} reservas criadas.`);
    }

    log(`Pronto. Entre com ${USUARIO_DEMO.email} (bibliotecária) ou ${USUARIO_LEITOR.email} (leitor), senha ${USUARIO_DEMO.password}.`);
}

module.exports = { seed: main, USUARIO_DEMO, USUARIO_LEITOR, LIVROS };

// Executado direto (npm run seed): conecta, popula e desconecta.
if (require.main === module) {
    if (!process.env.MONGO_URI) {
        console.error('Defina MONGO_URI no backend/.env para rodar o seed contra um MongoDB.');
        process.exit(1);
    }
    mongoose.connect(process.env.MONGO_URI)
        .then(() => { console.log('Conectado ao MongoDB.'); return main(); })
        .catch((error) => {
            console.error('Erro no seed:', error.message);
            process.exitCode = 1;
        })
        .finally(() => mongoose.disconnect());
}
