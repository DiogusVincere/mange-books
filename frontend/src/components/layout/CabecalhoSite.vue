<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';
import { sessao } from '@/sessao';
import { avisar } from '@/avisos';
import { primeiroNome, papel } from '@/formato';
import Logo from './Logo.vue';
import Icone from '@/components/ui/Icone.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Capa from '@/components/ui/Capa.vue';

const router = useRouter();
const route = useRoute();

const logado = sessao.logado;
const bibliotecario = sessao.bibliotecario;
const usuario = computed(() => sessao.estado.usuario);

// Busca rápida
const busca = ref('');
const resultados = ref([]);
const buscando = ref(false);
const listaAberta = ref(false);
let temporizador = null;

watch(busca, (valor) => {
  clearTimeout(temporizador);
  if (!valor.trim()) {
    resultados.value = [];
    listaAberta.value = false;
    return;
  }
  temporizador = setTimeout(pesquisar, 250);
});

async function pesquisar() {
  const q = busca.value.trim();
  if (!q) return;
  buscando.value = true;
  try {
    const { data } = await api.get('/books/search', { params: { q } });
    if (busca.value.trim() === q) {
      resultados.value = data.books || [];
      listaAberta.value = true;
    }
  } catch (erro) {
    resultados.value = [];
  } finally {
    buscando.value = false;
  }
}

function irParaCatalogo() {
  const q = busca.value.trim();
  fecharTudo();
  router.push({ name: 'catalogo', query: q ? { q } : {} });
}

function abrirLivro(id) {
  fecharTudo();
  busca.value = '';
  router.push({ name: 'livro', params: { id } });
}

// Menus
const menuAberto = ref(false);
const menuUsuario = ref(false);
const raiz = ref(null);

function fecharTudo() {
  listaAberta.value = false;
  menuUsuario.value = false;
  menuAberto.value = false;
}
function cliqueFora(e) {
  if (raiz.value && !raiz.value.contains(e.target)) {
    listaAberta.value = false;
    menuUsuario.value = false;
  }
}
function tecla(e) {
  if (e.key === 'Escape') fecharTudo();
}

onMounted(() => {
  document.addEventListener('click', cliqueFora);
  document.addEventListener('keydown', tecla);
  sessao.carregar();
});
onBeforeUnmount(() => {
  document.removeEventListener('click', cliqueFora);
  document.removeEventListener('keydown', tecla);
});
watch(() => route.fullPath, fecharTudo);
watch(menuAberto, (aberto) => {
  document.body.style.overflow = aberto ? 'hidden' : '';
});

function sair() {
  sessao.sair();
  fecharTudo();
  avisar('Você saiu. Até a próxima leitura!', 'info');
  if (route.meta.requiresAuth) router.push({ name: 'inicio' });
}
</script>

<template>
  <header ref="raiz" class="cabecalho">
    <div class="conteiner cabecalho__linha">
      <RouterLink :to="{ name: 'inicio' }" class="cabecalho__marca" aria-label="Mange Books, página inicial">
        <Logo />
      </RouterLink>

      <nav class="cabecalho__nav" aria-label="Principal">
        <RouterLink :to="{ name: 'inicio' }">Início</RouterLink>
        <RouterLink :to="{ name: 'catalogo' }">Catálogo</RouterLink>
      </nav>

      <form class="busca" role="search" @submit.prevent="irParaCatalogo">
        <Icone nome="busca" :tamanho="18" class="busca__icone" />
        <input
          v-model="busca"
          type="search"
          placeholder="Buscar por título ou autor"
          aria-label="Buscar livros"
          autocomplete="off"
          @focus="resultados.length && (listaAberta = true)"
        />
        <Transition name="fade">
          <ul v-if="listaAberta" class="busca__lista" role="listbox">
            <li v-for="l in resultados" :key="l._id" class="busca__item">
              <button type="button" @click="abrirLivro(l._id)">
                <Capa :src="l.coverImage" :titulo="l.title" tamanho="S" class="busca__capa" />
                <span class="busca__texto">
                  <strong>{{ l.title }}</strong>
                  <small>{{ l.author }} · {{ l.genre }}</small>
                </span>
              </button>
            </li>
            <li v-if="!resultados.length && !buscando" class="busca__nada">Nada encontrado para “{{ busca }}”.</li>
            <li class="busca__todos">
              <button type="button" @click="irParaCatalogo">
                Ver no catálogo <Icone nome="seta-dir" :tamanho="16" />
              </button>
            </li>
          </ul>
        </Transition>
      </form>

      <div class="cabecalho__acoes">
        <template v-if="logado">
          <button
            v-if="usuario"
            type="button"
            class="usuario"
            :aria-expanded="menuUsuario"
            aria-haspopup="menu"
            @click="menuUsuario = !menuUsuario"
          >
            <Avatar :nome="usuario.fullName" :tamanho="34" />
            <span class="usuario__nome">{{ primeiroNome(usuario.fullName) }}</span>
            <Icone nome="chevron" :tamanho="16" />
          </button>
          <span v-else class="esqueleto usuario__esqueleto" />
          <Transition name="fade">
            <div v-if="menuUsuario && usuario" class="menu" role="menu">
              <div class="menu__cabecalho">
                <strong>{{ usuario.fullName }}</strong>
                <small>{{ papel(usuario.role) }}</small>
              </div>
              <RouterLink :to="{ name: 'conta' }" role="menuitem"><Icone nome="usuario" :tamanho="17" /> Minha conta</RouterLink>
              <RouterLink :to="{ name: 'minhas-reservas' }" role="menuitem"><Icone nome="marcador" :tamanho="17" /> Minhas reservas</RouterLink>
              <RouterLink v-if="bibliotecario" :to="{ name: 'painel-livros' }" role="menuitem"><Icone nome="escudo" :tamanho="17" /> Painel da biblioteca</RouterLink>
              <button type="button" role="menuitem" @click="sair"><Icone nome="sair" :tamanho="17" /> Sair</button>
            </div>
          </Transition>
        </template>
        <template v-else>
          <RouterLink class="botao botao--fantasma cabecalho__entrar" :to="{ name: 'entrar' }">Entrar</RouterLink>
          <RouterLink class="botao botao--primario cabecalho__criar" :to="{ name: 'cadastro' }">Criar conta</RouterLink>
        </template>
        <button
          type="button"
          class="cabecalho__hamburguer"
          :aria-expanded="menuAberto"
          aria-label="Abrir menu"
          @click="menuAberto = !menuAberto"
        >
          <Icone :nome="menuAberto ? 'x' : 'menu'" :tamanho="22" />
        </button>
      </div>
    </div>

    <!-- Menu de celular -->
    <Transition name="fade">
      <div v-if="menuAberto" class="menu-movel">
        <nav aria-label="Principal (celular)">
          <RouterLink :to="{ name: 'inicio' }"><Icone nome="casa" :tamanho="18" /> Início</RouterLink>
          <RouterLink :to="{ name: 'catalogo' }"><Icone nome="livro-aberto" :tamanho="18" /> Catálogo</RouterLink>
          <template v-if="logado">
            <RouterLink :to="{ name: 'conta' }"><Icone nome="usuario" :tamanho="18" /> Minha conta</RouterLink>
            <RouterLink :to="{ name: 'minhas-reservas' }"><Icone nome="marcador" :tamanho="18" /> Minhas reservas</RouterLink>
            <RouterLink v-if="bibliotecario" :to="{ name: 'painel-livros' }"><Icone nome="escudo" :tamanho="18" /> Painel da biblioteca</RouterLink>
            <button type="button" @click="sair"><Icone nome="sair" :tamanho="18" /> Sair</button>
          </template>
          <template v-else>
            <RouterLink :to="{ name: 'entrar' }" class="botao botao--secundario botao--bloco">Entrar</RouterLink>
            <RouterLink :to="{ name: 'cadastro' }" class="botao botao--primario botao--bloco">Criar conta</RouterLink>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.cabecalho {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(246, 241, 232, 0.92);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--linha);
}
.cabecalho__linha {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 28px;
  height: 72px;
}
.cabecalho__marca {
  text-decoration: none;
}
.cabecalho__nav {
  display: flex;
  gap: 4px;
}
.cabecalho__nav a {
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--tinta-2);
  font-weight: 500;
  text-decoration: none;
}
.cabecalho__nav a:hover {
  background: rgba(27, 36, 48, 0.06);
  color: var(--tinta);
}
.cabecalho__nav a.router-link-active {
  color: var(--verde);
  font-weight: 600;
}
.cabecalho__nav a.router-link-exact-active {
  background: var(--verde-claro);
}

/* Busca */
.busca {
  position: relative;
  max-width: 520px;
  justify-self: center;
  width: 100%;
}
.busca__icone {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--tinta-3);
  pointer-events: none;
}
.busca input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border-radius: 999px;
  border: 1px solid var(--linha-2);
  background: var(--superficie);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.busca input:focus {
  border-color: var(--verde-2);
  box-shadow: 0 0 0 3px rgba(42, 107, 102, 0.18);
}
.busca input::-webkit-search-cancel-button {
  cursor: pointer;
}
.busca__lista {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--superficie);
  border: 1px solid var(--linha);
  border-radius: var(--raio);
  box-shadow: var(--sombra-2);
  z-index: 60;
  max-height: 420px;
  overflow: auto;
}
.busca__item button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 8px;
  border-radius: 10px;
}
.busca__item button:hover {
  background: var(--papel);
}
.busca__capa {
  width: 34px;
  flex: none;
}
.busca__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.busca__texto strong {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.busca__texto small {
  color: var(--tinta-3);
}
.busca__nada {
  padding: 14px 10px;
  color: var(--tinta-2);
  font-size: 0.92rem;
}
.busca__todos {
  border-top: 1px solid var(--linha);
  margin-top: 4px;
  padding-top: 4px;
}
.busca__todos button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  color: var(--verde);
  font-weight: 600;
}
.busca__todos button:hover {
  background: var(--verde-claro);
}

/* Ações */
.cabecalho__acoes {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.usuario {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  border: 1px solid transparent;
}
.usuario:hover,
.usuario[aria-expanded='true'] {
  background: var(--superficie);
  border-color: var(--linha);
}
.usuario__nome {
  font-weight: 600;
  font-size: 0.95rem;
}
.usuario__esqueleto {
  width: 120px;
  height: 36px;
  border-radius: 999px;
}
.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 240px;
  background: var(--superficie);
  border: 1px solid var(--linha);
  border-radius: var(--raio);
  box-shadow: var(--sombra-2);
  padding: 6px;
  z-index: 60;
}
.menu__cabecalho {
  padding: 10px 12px 12px;
  border-bottom: 1px solid var(--linha);
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
}
.menu__cabecalho small {
  color: var(--tinta-3);
}
.menu a,
.menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--tinta);
  text-decoration: none;
  font-size: 0.95rem;
  text-align: left;
}
.menu a:hover,
.menu button:hover {
  background: var(--papel);
}
.menu svg {
  color: var(--tinta-3);
}
.cabecalho__hamburguer {
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  place-items: center;
  color: var(--tinta);
}
.cabecalho__hamburguer:hover {
  background: rgba(27, 36, 48, 0.06);
}

/* Menu de celular */
.menu-movel {
  position: fixed;
  inset: 72px 0 0;
  background: var(--papel);
  padding: 20px 16px;
  overflow: auto;
  z-index: 49;
}
.menu-movel nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 520px;
  margin: 0 auto;
}
.menu-movel nav > a:not(.botao),
.menu-movel nav > button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--superficie);
  color: var(--tinta);
  font-weight: 500;
  text-decoration: none;
  border: 1px solid var(--linha);
  text-align: left;
}
.menu-movel nav > .botao {
  margin-top: 8px;
}

@media (max-width: 1024px) {
  .cabecalho__linha {
    gap: 16px;
  }
  .cabecalho__nav {
    display: none;
  }
  .cabecalho__linha {
    grid-template-columns: auto 1fr auto;
  }
}
@media (max-width: 720px) {
  .cabecalho__linha {
    grid-template-columns: auto 1fr auto;
    height: 64px;
    gap: 10px;
  }
  .busca {
    max-width: none;
  }
  .busca input {
    padding: 9px 12px 9px 38px;
    font-size: 0.95rem;
  }
  .cabecalho__entrar,
  .cabecalho__criar,
  .usuario__nome {
    display: none;
  }
  .cabecalho__hamburguer {
    display: grid;
  }
  .menu-movel {
    inset: 64px 0 0;
  }
}
</style>
