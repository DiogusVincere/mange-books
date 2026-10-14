<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sessao } from '@/sessao';
import { avisar } from '@/avisos';
import { papel } from '@/formato';
import Logo from './Logo.vue';
import Icone from '@/components/ui/Icone.vue';
import Avatar from '@/components/ui/Avatar.vue';

defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
});

const route = useRoute();
const router = useRouter();
const usuario = computed(() => sessao.estado.usuario);
const bibliotecario = sessao.bibliotecario;
const aberta = ref(false);

onMounted(() => sessao.carregar());
watch(() => route.fullPath, () => {
  aberta.value = false;
});

function sair() {
  sessao.sair();
  avisar('Você saiu. Até a próxima leitura!', 'info');
  router.push({ name: 'inicio' });
}

const LINKS_CONTA = [
  { nome: 'conta', rotulo: 'Minha conta', icone: 'usuario' },
  { nome: 'minhas-reservas', rotulo: 'Minhas reservas', icone: 'marcador' },
];
const LINKS_BIBLIOTECA = [
  { nome: 'painel-livros', rotulo: 'Acervo', icone: 'livro-aberto' },
  { nome: 'painel-livro-novo', rotulo: 'Novo livro', icone: 'mais' },
  { nome: 'painel-reservas', rotulo: 'Reservas e empréstimos', icone: 'caixa' },
  { nome: 'painel-usuarios', rotulo: 'Usuários', icone: 'usuarios' },
  { nome: 'painel-relatorios', rotulo: 'Relatórios', icone: 'grafico' },
];

function ativo(nome) {
  if (route.name === nome) return true;
  if (nome === 'painel-livros' && route.name === 'painel-livro-editar') return true;
  if (nome === 'painel-usuarios' && route.name === 'painel-usuario') return true;
  return false;
}
</script>

<template>
  <div class="painel">
    <div v-if="aberta" class="painel__sombra" @click="aberta = false" />
    <aside class="painel__lateral" :class="{ 'painel__lateral--aberta': aberta }">
      <RouterLink :to="{ name: 'inicio' }" class="painel__marca"><Logo /></RouterLink>

      <div v-if="usuario" class="painel__usuario">
        <Avatar :nome="usuario.fullName" :tamanho="42" />
        <div class="painel__usuario-texto">
          <strong>{{ usuario.fullName }}</strong>
          <span class="selo" :class="bibliotecario ? 'selo--verde' : 'selo--cinza'">{{ papel(usuario.role) }}</span>
        </div>
      </div>

      <nav class="painel__nav" aria-label="Painel">
        <p class="painel__grupo">Sua conta</p>
        <RouterLink v-for="l in LINKS_CONTA" :key="l.nome" :to="{ name: l.nome }" :class="{ ativo: ativo(l.nome) }">
          <Icone :nome="l.icone" :tamanho="18" /> {{ l.rotulo }}
        </RouterLink>
        <template v-if="bibliotecario">
          <p class="painel__grupo">Biblioteca</p>
          <RouterLink v-for="l in LINKS_BIBLIOTECA" :key="l.nome" :to="{ name: l.nome }" :class="{ ativo: ativo(l.nome) }">
            <Icone :nome="l.icone" :tamanho="18" /> {{ l.rotulo }}
          </RouterLink>
        </template>
      </nav>

      <div class="painel__pe">
        <RouterLink :to="{ name: 'inicio' }"><Icone nome="seta-esq" :tamanho="16" /> Voltar ao site</RouterLink>
        <button type="button" @click="sair"><Icone nome="sair" :tamanho="16" /> Sair</button>
      </div>
    </aside>

    <div class="painel__conteudo">
      <header class="painel__topo">
        <button type="button" class="painel__hamburguer" aria-label="Abrir menu do painel" @click="aberta = !aberta">
          <Icone nome="menu" :tamanho="22" />
        </button>
        <div class="painel__titulo">
          <h1>{{ titulo }}</h1>
          <p v-if="subtitulo">{{ subtitulo }}</p>
        </div>
        <div v-if="$slots.acoes" class="painel__acoes"><slot name="acoes" /></div>
      </header>
      <main class="painel__principal">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.painel {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 268px 1fr;
  background: var(--papel);
}
.painel__lateral {
  background: var(--superficie);
  border-right: 1px solid var(--linha);
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
}
.painel__marca {
  text-decoration: none;
  padding: 0 6px;
}
.painel__usuario {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: var(--papel);
}
.painel__usuario-texto {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.painel__usuario-texto strong {
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.painel__usuario-texto .selo {
  align-self: flex-start;
}
.painel__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.painel__grupo {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--tinta-3);
  font-weight: 600;
  margin: 14px 12px 6px;
}
.painel__nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--tinta-2);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
}
.painel__nav a svg {
  color: var(--tinta-3);
}
.painel__nav a:hover {
  background: var(--papel);
  color: var(--tinta);
}
.painel__nav a.ativo {
  background: var(--verde-claro);
  color: var(--verde);
  font-weight: 600;
}
.painel__nav a.ativo svg {
  color: var(--verde);
}
.painel__pe {
  border-top: 1px solid var(--linha);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.painel__pe a,
.painel__pe button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  color: var(--tinta-2);
  font-size: 0.9rem;
  text-decoration: none;
  text-align: left;
}
.painel__pe a:hover,
.painel__pe button:hover {
  background: var(--papel);
  color: var(--tinta);
}
.painel__conteudo {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.painel__topo {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 26px 36px 10px;
  flex-wrap: wrap;
}
.painel__titulo {
  flex: 1;
  min-width: 200px;
}
.painel__titulo h1 {
  font-size: clamp(1.6rem, 1.2rem + 1.2vw, 2.1rem);
  margin: 0;
}
.painel__titulo p {
  margin: 4px 0 0;
  color: var(--tinta-2);
}
.painel__acoes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.painel__principal {
  padding: 18px 36px 60px;
}
.painel__hamburguer {
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  place-items: center;
}
.painel__hamburguer:hover {
  background: rgba(27, 36, 48, 0.06);
}
.painel__sombra {
  display: none;
}
@media (max-width: 960px) {
  .painel {
    grid-template-columns: 1fr;
  }
  .painel__lateral {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(300px, 86vw);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: 80;
    box-shadow: var(--sombra-2);
  }
  .painel__lateral--aberta {
    transform: translateX(0);
  }
  .painel__sombra {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(27, 36, 48, 0.4);
    z-index: 70;
  }
  .painel__hamburguer {
    display: grid;
  }
  .painel__topo {
    padding: 18px 16px 6px;
  }
  .painel__principal {
    padding: 12px 16px 48px;
  }
}
</style>
