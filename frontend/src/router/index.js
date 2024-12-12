// Importando Vue e Vue Router (usando Vue 3)
import { createRouter, createWebHistory } from 'vue-router';

// Importe os componentes das páginas
import Home from '../views/Homes.vue';
import NotFound from '../views/NotFound.vue';
import Catalogo from '../views/Catalogo.vue';
import LivrosSolo from '../views/LivrosSolo.vue';
import Login from '@/components/Login.vue';
import RegistrarUsuario from '@/components/RegistrarUsuario.vue';
import UsersProfile from '@/views/UsersProfile.vue';
import CadastrarLivro from '@/views/CadastrarLivro.vue';
import EditarCatalogoLivro from '@/views/EditarCatalogoLivro.vue';
import UsersList from '../views/UsersList.vue';
import UserDetails from '../components/UserDetails.vue';
import BookReservations from '../views/BookReservations.vue';
import RelatoriosFile from '../views/RelatoriosFile.vue';

// Defina as rotas
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/:pathMatch(.*)*', // Rota para uma página que não existe (404)
    name: 'notfound',
    component: NotFound
  },
  {
    path: '/catalogo',
    name: 'catalogo',
    component: Catalogo
  },
  {
    path: '/livro/:id',
    name: 'livroSolo',
    component: LivrosSolo,
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'registrar',
    component: RegistrarUsuario
  },
  {
    path: '/cadastrarlivro',
    name: 'cadastrarlivro',
    component: CadastrarLivro
  },
  {
    path: '/editarcatalogo',
    name: 'editarcatalogo',
    component: EditarCatalogoLivro
  },
  {
    path: '/users',
    name: 'userlist',
    component: UsersList
  },
  {
    path: '/users/:id',
    name: 'userdetails',
    component: UserDetails
  },
  {
    path: '/bookloan',
    name: 'bookloan',
    component: BookReservations
  },
  {
    path: '/relatorios',
    name: 'relatorios',
    component: RelatoriosFile
  },
  {
    path: '/userprofile',
    name: 'userprofile',
    component: UsersProfile,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Faça login para acessar esta página.');
        next('/login'); // Redireciona para a página de login
      } else {
        next(); // Permite o acesso
      }
    },
  },
];

// Crie o router
const router = createRouter({
  history: createWebHistory(), // Usar o modo history
  routes // Rotas
});

// Adicione o guard (beforeEach) após o router ser criado
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // Verifique o token de autenticação
  if (to.name === 'login' && isAuthenticated) {
    next('/'); // Redirecione para a página inicial
  } else {
    next(); // Continue normalmente
  }
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login"); // Redireciona para login se não estiver autenticado
  } else {
    next(); // Permite acesso à rota
  }
});


export default router;
