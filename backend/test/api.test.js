// Testes de integração da API: sobem um MongoDB embutido, rodam o seed e exercitam
// as rotas pela rede, como o front faz. Rodar com: npm test
const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-so-para-os-testes';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const { seed, USUARIO_DEMO, USUARIO_LEITOR } = require('../seed');

let mongod;
let servidor;
let base;

const pedir = async (metodo, rota, { corpo, token } = {}) => {
    const resposta = await fetch(base + rota, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: corpo ? JSON.stringify(corpo) : undefined,
    });
    let dados = null;
    try { dados = await resposta.json(); } catch (e) { dados = null; }
    return { status: resposta.status, dados };
};

const logar = async (email, senha) => {
    const { status, dados } = await pedir('POST', '/api/auth/login', { corpo: { email, password: senha } });
    assert.equal(status, 200, `login de ${email} falhou: ${dados && dados.message}`);
    return dados.token;
};

test.before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    await seed({ silencioso: true });
    await new Promise((resolve) => { servidor = app.listen(0, resolve); });
    base = `http://127.0.0.1:${servidor.address().port}`;
});

test.after(async () => {
    await new Promise((resolve) => servidor.close(resolve));
    await mongoose.disconnect();
    await mongod.stop();
});

test('API responde e rota inexistente devolve 404 em JSON', async () => {
    const raiz = await pedir('GET', '/');
    assert.equal(raiz.status, 200);
    assert.equal(raiz.dados.status, 'ok');
    const sumida = await pedir('GET', '/nao-existe');
    assert.equal(sumida.status, 404);
    assert.equal(sumida.dados.message, 'Rota não encontrada');
});

test('catálogo público traz 36 livros com nota, total de avaliações e situação', async () => {
    const { status, dados } = await pedir('GET', '/books');
    assert.equal(status, 200);
    assert.ok(dados.length >= 36);
    const hobbit = dados.find((l) => l.isbn === '9780345339683');
    assert.ok(hobbit, 'O Hobbit deveria estar no seed');
    assert.equal(hobbit.totalAvaliacoes, 2);
    assert.equal(hobbit.notaMedia, 4.5);
    assert.equal(hobbit.situacao, 'disponivel');
    const sociedade = dados.find((l) => l.isbn === '9780547928210');
    assert.equal(sociedade.situacao, 'emprestado');
    const garota = dados.find((l) => l.isbn === '9780307588371');
    assert.equal(garota.situacao, 'reservado');
});

test('filtros do catálogo: gênero, texto e ordem', async () => {
    const terror = await pedir('GET', '/books?genero=Terror');
    assert.equal(terror.dados.length, 6);
    assert.ok(terror.dados.every((l) => l.genre === 'Terror'));
    const king = await pedir('GET', '/books?q=stephen%20king&ordem=titulo');
    assert.deepEqual(king.dados.map((l) => l.title), ['Carrie', 'It: A Coisa', 'O Iluminado']);
    const busca = await pedir('GET', '/books/search?q=hobbit');
    assert.equal(busca.dados.books.length, 1);
    const recentes = await pedir('GET', '/books/recent?limite=3');
    assert.equal(recentes.dados.length, 3);
});

test('login: credenciais erradas, certas e perfil com papel', async () => {
    const errado = await pedir('POST', '/api/auth/login', { corpo: { email: USUARIO_DEMO.email, password: 'errada' } });
    assert.equal(errado.status, 400);
    const token = await logar(USUARIO_DEMO.email, USUARIO_DEMO.password);
    const eu = await pedir('GET', '/api/auth/me', { token });
    assert.equal(eu.status, 200);
    assert.equal(eu.dados.role, 'bibliotecario');
    assert.equal(eu.dados.password, undefined);
    const semToken = await pedir('GET', '/api/auth/me');
    assert.equal(semToken.status, 401);
});

test('cadastro público valida campos e nunca aceita papel', async () => {
    const invalido = await pedir('POST', '/api/auth/register', { corpo: { email: 'x', password: '1' } });
    assert.equal(invalido.status, 400);
    assert.ok(invalido.dados.erros.email);
    assert.ok(invalido.dados.erros.password);
    const novo = {
        username: 'novoleitor', email: 'Novo@Exemplo.com', password: 'senha123', confirmPassword: 'senha123',
        fullName: 'Novo Leitor', birthDate: '1999-01-01', gender: 'Outro', cpf: '987.654.321-00', phone: '19 99999 1234',
        role: 'bibliotecario',
        address: { cep: '13010-000', numero: '10', logradouro: 'Rua Teste', bairro: 'Centro', cidade: 'Campinas', estado: 'SP' },
    };
    const criado = await pedir('POST', '/api/auth/register', { corpo: novo });
    assert.equal(criado.status, 201, criado.dados && criado.dados.message);
    assert.equal(criado.dados.usuario.role, 'leitor');
    const repetido = await pedir('POST', '/api/auth/register', { corpo: novo });
    assert.equal(repetido.status, 400);
    const token = await logar('novo@exemplo.com', 'senha123');
    const eu = await pedir('GET', '/api/auth/me', { token });
    assert.equal(eu.dados.cpf, '98765432100');
    assert.equal(eu.dados.phone, '(19) 99999-1234');
});

test('só bibliotecário cadastra, edita e exclui livros; validação devolve erros por campo', async () => {
    const leitor = await logar(USUARIO_LEITOR.email, USUARIO_LEITOR.password);
    const bib = await logar(USUARIO_DEMO.email, USUARIO_DEMO.password);
    const livro = {
        title: 'Livro de Teste', author: 'Autora Teste', description: 'Descrição de teste.', year: 2020,
        genre: 'Drama', pageCount: 100, coverType: 'Mole', isbn: '978-0-00-000000-2', coverUrl: 'https://exemplo.com/capa.jpg',
    };
    const negado = await pedir('POST', '/books', { corpo: livro, token: leitor });
    assert.equal(negado.status, 403);
    const semLogin = await pedir('POST', '/books', { corpo: livro });
    assert.equal(semLogin.status, 401);

    const ruim = await pedir('POST', '/books', { corpo: { ...livro, genre: 'Romance', year: 'abc', isbn: '12' }, token: bib });
    assert.equal(ruim.status, 400);
    assert.ok(ruim.dados.erros.genre && ruim.dados.erros.year && ruim.dados.erros.isbn);

    const criado = await pedir('POST', '/books', { corpo: livro, token: bib });
    assert.equal(criado.status, 201, criado.dados && criado.dados.message);
    assert.equal(criado.dados.isbn, '9780000000002');
    assert.equal(criado.dados.coverImage, 'https://exemplo.com/capa.jpg');

    const duplicado = await pedir('POST', '/books', { corpo: livro, token: bib });
    assert.equal(duplicado.status, 400);
    assert.ok(duplicado.dados.erros.isbn);

    const editado = await pedir('PUT', `/books/${criado.dados._id}`, { corpo: { title: 'Livro Editado' }, token: bib });
    assert.equal(editado.status, 200);
    assert.equal(editado.dados.title, 'Livro Editado');
    assert.equal(editado.dados.author, 'Autora Teste');

    const excluido = await pedir('DELETE', `/books/${criado.dados._id}`, { token: bib });
    assert.equal(excluido.status, 200);
    const sumiu = await pedir('GET', `/books/${criado.dados._id}`);
    assert.equal(sumiu.status, 404);
    const idRuim = await pedir('GET', '/books/123');
    assert.equal(idRuim.status, 400);
});

test('avaliações: criar, atualizar a própria, listar, nota média e excluir', async () => {
    const leitor = await logar(USUARIO_LEITOR.email, USUARIO_LEITOR.password);
    const bib = await logar(USUARIO_DEMO.email, USUARIO_DEMO.password);
    const { dados: lista } = await pedir('GET', '/books?q=Frankenstein');
    const livro = lista[0];
    assert.equal(livro.totalAvaliacoes, 0);

    const semLogin = await pedir('POST', '/reviews/create', { corpo: { bookId: livro._id, rating: 5 } });
    assert.equal(semLogin.status, 401);
    const notaRuim = await pedir('POST', '/reviews/create', { corpo: { bookId: livro._id, rating: 7 }, token: leitor });
    assert.equal(notaRuim.status, 400);

    const criada = await pedir('POST', '/reviews/create', { corpo: { bookId: livro._id, rating: 4, comment: 'Bom.' }, token: leitor });
    assert.equal(criada.status, 201);
    const atualizada = await pedir('POST', '/reviews/create', { corpo: { bookId: livro._id, rating: 5, comment: 'Ótimo.' }, token: leitor });
    assert.equal(atualizada.status, 200);

    const avaliacoes = await pedir('GET', `/reviews/${livro._id}`);
    assert.equal(avaliacoes.dados.length, 1);
    assert.equal(avaliacoes.dados[0].rating, 5);
    assert.equal(avaliacoes.dados[0].userName, USUARIO_LEITOR.fullName);

    const detalhe = await pedir('GET', `/books/${livro._id}`);
    assert.equal(detalhe.dados.totalAvaliacoes, 1);
    assert.equal(detalhe.dados.notaMedia, 5);

    const outraPessoa = await pedir('DELETE', `/reviews/${avaliacoes.dados[0]._id}`, { token: await logar('ana@exemplo.com', 'demo1234') });
    assert.equal(outraPessoa.status, 403);
    const bibExclui = await pedir('DELETE', `/reviews/${avaliacoes.dados[0]._id}`, { token: bib });
    assert.equal(bibExclui.status, 200);
});

test('reservas: ciclo completo e regras de permissão', async () => {
    const leitor = await logar(USUARIO_LEITOR.email, USUARIO_LEITOR.password);
    const bib = await logar(USUARIO_DEMO.email, USUARIO_DEMO.password);
    const { dados: lista } = await pedir('GET', '/books?q=Carrie');
    const livro = lista[0];

    const reserva = await pedir('POST', '/api/reservations/reserve', { corpo: { bookId: livro._id }, token: leitor });
    assert.equal(reserva.status, 201, reserva.dados && reserva.dados.message);
    const idReserva = reserva.dados.reservation._id;
    const repetida = await pedir('POST', '/api/reservations/reserve', { corpo: { bookId: livro._id }, token: leitor });
    assert.equal(repetida.status, 400);

    const detalhe = await pedir('GET', `/books/${livro._id}`, { token: leitor });
    assert.equal(detalhe.dados.situacao, 'reservado');
    assert.equal(detalhe.dados.minhaReserva.status, 'Reservado');
    const visitante = await pedir('GET', `/books/${livro._id}`);
    assert.equal(visitante.dados.minhaReserva, null);

    const minhas = await pedir('GET', '/api/reservations', { token: leitor });
    assert.ok(minhas.dados.some((r) => r._id === idReserva));
    const todasNegado = await pedir('GET', '/api/reservations/todas', { token: leitor });
    assert.equal(todasNegado.status, 403);
    const todas = await pedir('GET', '/api/reservations/todas', { token: bib });
    assert.ok(todas.dados.some((r) => r._id === idReserva && r.book.title === 'Carrie' && r.user.email === USUARIO_LEITOR.email));

    const naoExcluir = await pedir('DELETE', `/books/${livro._id}`, { token: bib });
    assert.equal(naoExcluir.status, 400);

    const emprestarNegado = await pedir('POST', '/api/reservations/loan', { corpo: { reservationId: idReserva }, token: leitor });
    assert.equal(emprestarNegado.status, 403);
    const emprestado = await pedir('POST', '/api/reservations/loan', { corpo: { reservationId: idReserva }, token: bib });
    assert.equal(emprestado.status, 200);
    assert.equal(emprestado.dados.reservation.status, 'Emprestado');
    const cancelarTarde = await pedir('POST', '/api/reservations/cancel', { corpo: { reservationId: idReserva }, token: leitor });
    assert.equal(cancelarTarde.status, 400);
    const devolvido = await pedir('POST', '/api/reservations/return', { corpo: { reservationId: idReserva }, token: bib });
    assert.equal(devolvido.status, 200);
    assert.equal(devolvido.dados.reservation.status, 'Devolvido');

    const historico = await pedir('GET', '/api/reservations/history', { token: leitor });
    assert.ok(historico.dados.some((r) => r._id === idReserva));

    // Cancelamento pelo próprio leitor
    const nova = await pedir('POST', '/api/reservations/reserve', { corpo: { bookId: livro._id }, token: leitor });
    assert.equal(nova.status, 201);
    const cancelada = await pedir('POST', '/api/reservations/cancel', { corpo: { reservationId: nova.dados.reservation._id }, token: leitor });
    assert.equal(cancelada.status, 200);
    assert.equal(cancelada.dados.reservation.status, 'Cancelado');
    const livre = await pedir('GET', `/books/${livro._id}`);
    assert.equal(livre.dados.situacao, 'disponivel');
});

test('limite de três reservas em aberto por leitor', async () => {
    const ana = await logar('ana@exemplo.com', 'demo1234');
    // Ana já tem 1 empréstimo em aberto no seed; cabem mais duas reservas.
    const { dados: lista } = await pedir('GET', '/books?genero=Ficção&ordem=titulo');
    const livres = lista.filter((l) => l.situacao === 'disponivel');
    const r1 = await pedir('POST', '/api/reservations/reserve', { corpo: { bookId: livres[0]._id }, token: ana });
    const r2 = await pedir('POST', '/api/reservations/reserve', { corpo: { bookId: livres[1]._id }, token: ana });
    const r3 = await pedir('POST', '/api/reservations/reserve', { corpo: { bookId: livres[2]._id }, token: ana });
    assert.equal(r1.status, 201);
    assert.equal(r2.status, 201);
    assert.equal(r3.status, 400);
    assert.match(r3.dados.message, /3 reservas/);
});

test('relatórios só para bibliotecários e com dados reais', async () => {
    const leitor = await logar(USUARIO_LEITOR.email, USUARIO_LEITOR.password);
    const bib = await logar(USUARIO_DEMO.email, USUARIO_DEMO.password);
    assert.equal((await pedir('GET', '/api/reports/resumo', { token: leitor })).status, 403);
    const resumo = await pedir('GET', '/api/reports/resumo', { token: bib });
    assert.equal(resumo.status, 200);
    assert.ok(resumo.dados.livros >= 36);
    assert.equal(resumo.dados.porGenero.length, 6);
    const livros = await pedir('GET', '/api/reports/books', { token: bib });
    assert.ok(livros.dados.length > 0 && livros.dados[0].name && livros.dados[0].count >= 1);
    const usuarios = await pedir('GET', '/api/reports/users', { token: bib });
    assert.ok(usuarios.dados.some((u) => u.name === 'Ana Souza'));
    const notas = await pedir('GET', '/api/reports/ratings', { token: bib });
    assert.ok(notas.dados.length > 0 && notas.dados[0].count <= 5);
});

test('usuários: lista só para bibliotecário, cada um edita só o seu, papel só muda por bibliotecário', async () => {
    const leitor = await logar(USUARIO_LEITOR.email, USUARIO_LEITOR.password);
    const bib = await logar(USUARIO_DEMO.email, USUARIO_DEMO.password);
    assert.equal((await pedir('GET', '/api/auth', { token: leitor })).status, 403);
    const lista = await pedir('GET', '/api/auth', { token: bib });
    assert.equal(lista.status, 200);
    assert.ok(lista.dados.every((u) => u.password === undefined));

    const eu = await pedir('GET', '/api/auth/me', { token: leitor });
    const ana = lista.dados.find((u) => u.email === 'ana@exemplo.com');
    assert.equal((await pedir('GET', `/api/auth/${ana._id}`, { token: leitor })).status, 403);
    assert.equal((await pedir('GET', `/api/auth/${eu.dados._id}`, { token: leitor })).status, 200);

    const meuTelefone = await pedir('PUT', `/api/auth/${eu.dados._id}`, { corpo: { phone: '19988887777' }, token: leitor });
    assert.equal(meuTelefone.status, 200);
    assert.equal(meuTelefone.dados.phone, '(19) 98888-7777');
    const promoverSozinho = await pedir('PUT', `/api/auth/${eu.dados._id}`, { corpo: { role: 'bibliotecario' }, token: leitor });
    assert.equal(promoverSozinho.status, 403);
    const promovido = await pedir('PUT', `/api/auth/${ana._id}`, { corpo: { role: 'bibliotecario' }, token: bib });
    assert.equal(promovido.status, 200);
    assert.equal(promovido.dados.role, 'bibliotecario');
    const rebaixado = await pedir('PUT', `/api/auth/${ana._id}`, { corpo: { role: 'leitor' }, token: bib });
    assert.equal(rebaixado.dados.role, 'leitor');

    const excluirComReserva = await pedir('DELETE', `/api/auth/${ana._id}`, { token: bib });
    assert.equal(excluirComReserva.status, 400);
});

test('troca de senha exige a atual e passa a valer no login', async () => {
    const token = await logar('carla@exemplo.com', 'demo1234');
    const errada = await pedir('PUT', '/api/auth/me/senha', { corpo: { senhaAtual: 'xxx', novaSenha: 'novasenha1' }, token });
    assert.equal(errada.status, 400);
    const curta = await pedir('PUT', '/api/auth/me/senha', { corpo: { senhaAtual: 'demo1234', novaSenha: '123' }, token });
    assert.equal(curta.status, 400);
    const ok = await pedir('PUT', '/api/auth/me/senha', { corpo: { senhaAtual: 'demo1234', novaSenha: 'novasenha1' }, token });
    assert.equal(ok.status, 200);
    const antiga = await pedir('POST', '/api/auth/login', { corpo: { email: 'carla@exemplo.com', password: 'demo1234' } });
    assert.equal(antiga.status, 400);
    await logar('carla@exemplo.com', 'novasenha1');
});
