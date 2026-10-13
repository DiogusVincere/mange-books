# Mange Book

Sistema de biblioteca: catálogo de livros, reservas e empréstimos, avaliações e relatórios, com cadastro e login de usuários. Front em Vue 3 e API em Express com MongoDB.

## Funcionalidades

- Cadastro de usuário (nome, CPF, telefone, endereço completado pelo ViaCEP) e login com token JWT, válido por 1 hora.
- Catálogo com filtro por gênero (Fantasia, Terror, Drama, Suspense, Ação, Ficção) e busca por título ou autor no cabeçalho.
- Página do livro: capa, autor, páginas, tipo de capa, ISBN, avaliações (nota de 1 a 5 e comentário) e botão de reserva.
- Página inicial com carrossel, últimos livros adicionados e próximos eventos.
- Área logada: cadastrar livro com capa (upload até 2 MB), editar e excluir livros do catálogo.
- Reservas: reservar, registrar empréstimo e devolução, histórico de empréstimos.
- Perfil do usuário logado; lista de usuários com detalhes, edição e exclusão.
- Relatórios com gráficos (Chart.js) e exportação em PDF e Excel. Os gráficos do front ainda usam dados de exemplo; a API expõe `/api/reports` com as agregações.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front | Vue 3, Vite, vue-router, axios, Chart.js, jsPDF, SheetJS (xlsx) |
| Back | Node.js, Express, Mongoose (MongoDB Atlas ou local), jsonwebtoken, bcryptjs, multer, dotenv |

## Estrutura

```
backend/
  app.js             Express: CORS, JSON, /uploads e rotas (exporta o app)
  server.js          lê o .env, conecta ao MongoDB e sobe o servidor
  seed.js            cria o usuário demo e seis livros de exemplo
  cleanup.js         manutenção: remove usuários sem username
  controllers/       regras de autenticação, livros, reservas e avaliações
  models/            User, Book, Reservation, Review, LoanHistory
  routes/            /api/auth, /books, /reviews, /api/reservations, /api/reports
  middleware/auth.js valida o token e põe req.userId
  uploads/           capas enviadas (só o .gitkeep é versionado)
  .env.example       variáveis necessárias
frontend/
  src/api.js         instância única do axios (baseURL = VITE_API_URL) e urlImagem()
  src/router/        rotas; as privadas têm meta.requiresAuth
  src/views/         páginas
  src/components/    componentes
  src/assets/        imagens e CSS
  .env.example       VITE_API_URL
  vercel.json        deploy do front na Vercel
render.yaml          deploy do back no Render
```

## Como rodar

Pré-requisitos: Node.js 18 ou mais novo (recomendado 20), npm e um MongoDB.

1. **Banco de dados.** No [MongoDB Atlas](https://www.mongodb.com/atlas) (plano gratuito) crie um cluster, um usuário de banco e libere o seu IP em *Network Access*; copie a string de conexão (`mongodb+srv://USUARIO:SENHA@...`). Ou use um MongoDB local: `mongodb://localhost:27017/mangebook`.

2. **Back-end.**

   ```bash
   cd backend
   cp .env.example .env      # preencha MONGO_URI e JWT_SECRET
   npm install
   npm run seed              # opcional: usuário demo e seis livros
   npm run dev               # http://localhost:5000 (nodemon); em produção, npm start
   ```

   Para gerar um `JWT_SECRET` forte: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

3. **Front-end.**

   ```bash
   cd frontend
   cp .env.example .env      # VITE_API_URL=http://localhost:5000
   npm install
   npm run dev               # http://localhost:5173
   ```

Os arquivos `package-lock.json` foram removidos ao podar dependências; o `npm install` gera novos.

Conta de demonstração criada pelo seed: **demo@demo.com** / **demo1234**.

## API

| Método | Rota | Precisa de token |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | não |
| GET | `/api/auth/me` | sim |
| GET, PUT, DELETE | `/api/auth` (lista) e `/api/auth/:id` | sim |
| GET | `/books`, `/books/recent`, `/books/search?q=`, `/books/:id` | não |
| POST, PUT, DELETE | `/books`, `/books/:id` (multipart, campo `coverImage`) | sim |
| GET | `/reviews/:bookId` | não |
| POST, DELETE | `/reviews/create`, `/reviews/:reviewId` | sim |
| POST, GET | `/api/reservations/reserve`, `/loan`, `/return`, `/history`, `/` | sim |
| GET | `/api/reports/books`, `/users`, `/ratings` | sim |

Token no cabeçalho `Authorization: Bearer <token>`. A capa de um livro vem em `coverImage` como caminho relativo (`uploads/arquivo.jpg`, servido em `/uploads`) ou como URL completa (livros do seed).

## Segurança

O que foi fechado nesta versão:

- **Histórico reescrito.** `backend/.env`, logs (que traziam senhas em texto puro de uma versão antiga do cadastro), `node_modules`, `uploads`, caches do Vite e `Thumbs.db` saíram de todos os commits; a string de conexão do Mongo e o `JWT_SECRET` antigos foram substituídos em qualquer ocorrência. **Mesmo assim, troque a senha do usuário do Atlas e gere um `JWT_SECRET` novo**: os valores antigos já circularam.
- Rotas de usuário (listar, consultar, editar, excluir) e as de escrita de livros e de relatórios exigem token. Cadastro, login, catálogo e leitura de avaliações continuam abertos.
- Nenhuma resposta devolve o hash da senha nem o objeto de erro interno do servidor.
- Atualização de usuário aceita só os campos previstos e ignora `password` (o `findByIdAndUpdate` não passa pelo hash); ainda não há troca de senha.
- O token não é mais escrito no console (front e back); o back não despeja mais documentos com CPF nos logs.
- CORS e URL da API saem de variáveis de ambiente; `.env` ignorado pelo git, com `.env.example` nos dois lados.

O que ainda falta:

- Não há perfis (administrador × leitor): qualquer usuário logado pode cadastrar e excluir livros e usuários.
- Token de 1 hora sem renovação; o front só confere se existe token, não se expirou.
- Validação de entrada mínima (CPF, telefone e ISBN sem formato conferido).
- Os relatórios do front são estáticos.

## Implantação

Back no **Render** e front na **Vercel**. O back grava capas em disco (`uploads/`) e mantém conexão persistente com o Mongo, o que não combina com função serverless; por isso não foi para a Vercel.

- **Render** (`render.yaml` na raiz): *New > Blueprint*, apontar para este repositório e preencher `MONGO_URI`, `JWT_SECRET` e `CORS_ORIGIN` (a URL do front na Vercel; várias origens separadas por vírgula). No plano gratuito o disco é efêmero: as capas enviadas somem a cada deploy. Para persistir, use um disco do Render (bloco comentado no `render.yaml`) ou troque o armazenamento por um serviço externo.
- **Vercel** (`frontend/vercel.json`): importar o repositório com *Root Directory* = `frontend` e definir `VITE_API_URL` com a URL do serviço do Render. O rewrite para `index.html` atende ao vue-router em modo history.

## Modo demonstração (sem MongoDB)

Sem `MONGO_URI`, o `server.js` sobe um **MongoDB embutido no próprio processo**
(`mongodb-memory-server`), roda o seed e gera um `JWT_SECRET` temporário. É o modo da demo
pública: o serviço gratuito reinicia de tempos em tempos e volta sempre com o usuário
`demo@demo.com` / `demo1234` e os seis livros de exemplo. Tudo o que for cadastrado some no
reinício. Com um Atlas ou Mongo local, basta definir `MONGO_URI` que o modo normal assume.

## Telas

![Página inicial do Mange Book](docs/prints/home.png)

Página inicial da demonstração em https://mange-books.vercel.app: carrossel, últimos livros adicionados (capas pela Open Library) e busca. Entre com `demo@demo.com` / `demo1234` para ver reservas, avaliações e perfil.

## Demonstração



## Equipe

- Diogo Vieira de Lima ([DiogusVincere](https://github.com/DiogusVincere))

## Licença

[MIT](LICENSE).
