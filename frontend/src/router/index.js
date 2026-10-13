import { createRouter, createWebHistory } from 'vue-router';

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

// Rotas com meta.requiresAuth exigem token no localStorage (ver beforeEach abaixo).
const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/catalogo', name: 'catalogo', component: Catalogo },
  { path: '/livro/:id', name: 'livroSolo', component: LivrosSolo, props: true },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'registrar', component: RegistrarUsuario },

  { path: '/userprofile', name: 'userprofile', component: UsersProfile, meta: { requiresAuth: true } },
  { path: '/bookloan', name: 'bookloan', component: BookReservations, meta: { requiresAuth: true } },
  { path: '/cadastrarlivro', name: 'cadastrarlivro', component: CadastrarLivro, meta: { requiresAuth: true } },
  { path: '/editarcatalogo', name: 'editarcatalogo', component: EditarCatalogoLivro, meta: { requiresAuth: true } },
  { path: '/users', name: 'userlist', component: UsersList, meta: { requiresAuth: true } },
  { path: '/users/:id', name: 'userdetails', component: UserDetails, meta: { requiresAuth: true } },
  { path: '/relatorios', name: 'relatorios', component: RelatoriosFile, meta: { requiresAuth: true } },

  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Um único guard: quem não está logado não entra em rota privada (volta para o
// login guardando o destino); quem já está logado não precisa da tela de login.
router.beforeEach((to) => {
  const autenticado = Boolean(localStorage.getItem('token'));

  if (to.meta.requiresAuth && !autenticado) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && autenticado) {
    return { name: 'home' };
  }
  return true;
});

export default router;
