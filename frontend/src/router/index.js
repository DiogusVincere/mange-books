import { createRouter, createWebHistory } from 'vue-router';
import { sessao } from '@/sessao';
import { avisar } from '@/avisos';

// meta.requiresAuth: precisa estar logado. meta.bibliotecario: precisa do papel.
// meta.visitante: só para quem não está logado (login e cadastro).
const routes = [
  { path: '/', name: 'inicio', component: () => import('@/views/Inicio.vue'), meta: { titulo: 'Início' } },
  { path: '/catalogo', name: 'catalogo', component: () => import('@/views/Catalogo.vue'), meta: { titulo: 'Catálogo' } },
  { path: '/livro/:id', name: 'livro', component: () => import('@/views/Livro.vue'), props: true, meta: { titulo: 'Livro' } },
  { path: '/entrar', name: 'entrar', component: () => import('@/views/Entrar.vue'), meta: { titulo: 'Entrar', visitante: true } },
  { path: '/cadastro', name: 'cadastro', component: () => import('@/views/Cadastro.vue'), meta: { titulo: 'Criar conta', visitante: true } },

  { path: '/conta', name: 'conta', component: () => import('@/views/painel/MinhaConta.vue'), meta: { titulo: 'Minha conta', requiresAuth: true } },
  { path: '/conta/reservas', name: 'minhas-reservas', component: () => import('@/views/painel/MinhasReservas.vue'), meta: { titulo: 'Minhas reservas', requiresAuth: true } },

  { path: '/painel', redirect: { name: 'painel-livros' } },
  { path: '/painel/livros', name: 'painel-livros', component: () => import('@/views/painel/Livros.vue'), meta: { titulo: 'Acervo', requiresAuth: true, bibliotecario: true } },
  { path: '/painel/livros/novo', name: 'painel-livro-novo', component: () => import('@/views/painel/EditarLivro.vue'), meta: { titulo: 'Novo livro', requiresAuth: true, bibliotecario: true } },
  { path: '/painel/livros/:id/editar', name: 'painel-livro-editar', component: () => import('@/views/painel/EditarLivro.vue'), props: true, meta: { titulo: 'Editar livro', requiresAuth: true, bibliotecario: true } },
  { path: '/painel/reservas', name: 'painel-reservas', component: () => import('@/views/painel/Reservas.vue'), meta: { titulo: 'Reservas e empréstimos', requiresAuth: true, bibliotecario: true } },
  { path: '/painel/usuarios', name: 'painel-usuarios', component: () => import('@/views/painel/Usuarios.vue'), meta: { titulo: 'Usuários', requiresAuth: true, bibliotecario: true } },
  { path: '/painel/usuarios/:id', name: 'painel-usuario', component: () => import('@/views/painel/Usuario.vue'), props: true, meta: { titulo: 'Usuário', requiresAuth: true, bibliotecario: true } },
  { path: '/painel/relatorios', name: 'painel-relatorios', component: () => import('@/views/painel/Relatorios.vue'), meta: { titulo: 'Relatórios', requiresAuth: true, bibliotecario: true } },

  // Caminhos da versão anterior
  { path: '/login', redirect: '/entrar' },
  { path: '/register', redirect: '/cadastro' },
  { path: '/userprofile', redirect: '/conta' },
  { path: '/bookloan', redirect: '/painel/reservas' },
  { path: '/cadastrarlivro', redirect: '/painel/livros/novo' },
  { path: '/editarcatalogo', redirect: '/painel/livros' },
  { path: '/users', redirect: '/painel/usuarios' },
  { path: '/relatorios', redirect: '/painel/relatorios' },

  { path: '/:pathMatch(.*)*', name: 'nao-encontrado', component: () => import('@/views/NaoEncontrado.vue'), meta: { titulo: 'Página não encontrada' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, posicaoSalva) {
    if (posicaoSalva) return posicaoSalva;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !sessao.logado.value) {
    return { name: 'entrar', query: { redirect: to.fullPath } };
  }
  if (to.meta.visitante && sessao.logado.value) {
    return { name: 'conta' };
  }
  if (to.meta.bibliotecario) {
    await sessao.carregar();
    if (!sessao.bibliotecario.value) {
      avisar('Essa área é só para bibliotecários.', 'aviso');
      return { name: 'conta' };
    }
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.titulo ? `${to.meta.titulo} · Mange Books` : 'Mange Books';
});

export default router;
