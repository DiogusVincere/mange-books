// Importando Vue e Vue Router (usando Vue 3)
import { createRouter, createWebHistory } from 'vue-router'; // Função para criar o roteador e usar o histórico da web

// Importe os componentes das páginas
import Home from '../views/Homes.vue'; // Componente da página inicial
import NotFound from '../views/NotFound.vue'; // Componente para páginas não encontradas (erro 404)
import Catalogo from '../views/Catalogo.vue'; // Componente para o catálogo de livros
import LivrosSolo from '../views/LivrosSolo.vue'; // Componente para detalhes de um livro
import Login from '@/components/Login.vue'; // Componente para a página de login
import RegistrarUsuario from '@/components/RegistrarUsuario.vue'; // Componente para registrar um novo usuário
import UsersProfile from '@/views/UsersProfile.vue'; // Componente para o perfil do usuário
import CadastrarLivro from '@/views/CadastrarLivro.vue'; // Componente para cadastrar um livro
import EditarCatalogoLivro from '@/views/EditarCatalogoLivro.vue'; // Componente para editar um livro no catálogo
import UsersList from '../views/UsersList.vue'; // Componente para listar os usuários
import UserDetails from '../components/UserDetails.vue'; // Componente para mostrar detalhes de um usuário
import BookReservations from '../views/BookReservations.vue'; // Componente para visualizar as reservas de livros
import RelatoriosFile from '../views/RelatoriosFile.vue'; // Componente para visualizar relatórios

// Defina as rotas
const routes = [
  {
    path: '/', // Caminho da rota
    name: 'home', // Nome da rota
    component: Home // Componente a ser carregado para essa rota
  },
  {
    path: '/:pathMatch(.*)*', // Rota para uma página que não existe (404)
    name: 'notfound', // Nome da rota para página não encontrada
    component: NotFound // Componente de página não encontrada
  },
  {
    path: '/catalogo', // Caminho da rota para o catálogo
    name: 'catalogo', // Nome da rota para o catálogo
    component: Catalogo // Componente para o catálogo de livros
  },
  {
    path: '/livro/:id', // Rota dinâmica para detalhes de um livro (usando o ID)
    name: 'livroSolo', // Nome da rota para detalhes do livro
    component: LivrosSolo, // Componente para detalhes de um livro
    props: true // Passa o parâmetro da URL como props para o componente
  },
  {
    path: '/login', // Caminho da rota para login
    name: 'login', // Nome da rota para login
    component: Login // Componente para a página de login
  },
  {
    path: '/register', // Caminho para registrar um novo usuário
    name: 'registrar', // Nome da rota para registrar
    component: RegistrarUsuario // Componente para registrar um novo usuário
  },
  {
    path: '/cadastrarlivro', // Caminho para cadastrar um livro
    name: 'cadastrarlivro', // Nome da rota para cadastro de livro
    component: CadastrarLivro // Componente para cadastro de um livro
  },
  {
    path: '/editarcatalogo', // Caminho para editar o catálogo de livros
    name: 'editarcatalogo', // Nome da rota para editar o catálogo
    component: EditarCatalogoLivro // Componente para editar o livro no catálogo
  },
  {
    path: '/users', // Caminho para listar os usuários
    name: 'userlist', // Nome da rota para listar os usuários
    component: UsersList // Componente para a lista de usuários
  },
  {
    path: '/users/:id', // Rota dinâmica para detalhes de um usuário (usando o ID)
    name: 'userdetails', // Nome da rota para detalhes de usuário
    component: UserDetails // Componente para mostrar detalhes de um usuário
  },
  {
    path: '/bookloan', // Caminho para visualizar as reservas de livros
    name: 'bookloan', // Nome da rota para reservas de livros
    component: BookReservations // Componente para mostrar as reservas de livros
  },
  {
    path: '/relatorios', // Caminho para acessar relatórios
    name: 'relatorios', // Nome da rota para relatórios
    component: RelatoriosFile // Componente para mostrar relatórios
  },
  {
    path: '/userprofile', // Caminho para acessar o perfil do usuário
    name: 'userprofile', // Nome da rota para o perfil do usuário
    component: UsersProfile, // Componente para mostrar o perfil do usuário
    beforeEnter: (to, from, next) => { // Guarda de rota para verificar se o usuário está autenticado
      const token = localStorage.getItem('token'); // Verifica se há token de autenticação no armazenamento local
      if (!token) {
        alert('Faça login para acessar esta página.'); // Alerta se não estiver autenticado
        next('/login'); // Redireciona para a página de login
      } else {
        next(); // Permite o acesso à rota
      }
    },
  },
];

// Crie o router
const router = createRouter({
  history: createWebHistory(), // Usar o modo history para navegação sem hashes na URL
  routes // Passa as rotas definidas
});

// Adicione o guard (beforeEach) após o router ser criado
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // Verifica se há um token de autenticação
  if (to.name === 'login' && isAuthenticated) {
    next('/'); // Se o usuário estiver autenticado e tentar acessar a página de login, redireciona para a página inicial
  } else {
    next(); // Caso contrário, continua com a navegação
  }
});

// Adiciona um guard adicional para rotas que exigem autenticação
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Verifica se o usuário está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login"); // Se a rota exigir autenticação e o usuário não estiver autenticado, redireciona para login
  } else {
    next(); // Caso contrário, permite o acesso à rota
  }
});

export default router; // Exporta o router para ser utilizado na aplicação