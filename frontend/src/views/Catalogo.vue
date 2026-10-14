<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { mensagemDeErro } from '@/api';
import { GENEROS } from '@/formato';
import LayoutSite from '@/components/layout/LayoutSite.vue';
import CartaoLivro from '@/components/livros/CartaoLivro.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const route = useRoute();
const router = useRouter();

const livros = ref([]);
const carregando = ref(true);
const erro = ref('');

const termo = ref(String(route.query.q || ''));
const genero = ref(String(route.query.genero || ''));
const ordem = ref(String(route.query.ordem || 'recentes'));
const soDisponiveis = ref(route.query.disponiveis === '1');

const ORDENS = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'titulo', rotulo: 'Título (A–Z)' },
  { valor: 'autor', rotulo: 'Autor (A–Z)' },
  { valor: 'ano', rotulo: 'Ano (mais novos)' },
  { valor: 'nota', rotulo: 'Melhor avaliados' },
];

onMounted(carregar);

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const { data } = await api.get('/books');
    livros.value = data;
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível carregar o catálogo.');
  } finally {
    carregando.value = false;
  }
}

// URL <-> filtros (para links do tipo /catalogo?genero=Terror funcionarem e serem compartilháveis)
watch(
  () => route.query,
  (q) => {
    termo.value = String(q.q || '');
    genero.value = String(q.genero || '');
    ordem.value = String(q.ordem || 'recentes');
    soDisponiveis.value = q.disponiveis === '1';
  },
);
function atualizarUrl() {
  const query = {};
  if (termo.value.trim()) query.q = termo.value.trim();
  if (genero.value) query.genero = genero.value;
  if (ordem.value !== 'recentes') query.ordem = ordem.value;
  if (soDisponiveis.value) query.disponiveis = '1';
  router.replace({ name: 'catalogo', query });
}
watch([genero, ordem, soDisponiveis], atualizarUrl);
let temporizador = null;
watch(termo, () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(atualizarUrl, 300);
});

const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const filtrados = computed(() => {
  let lista = livros.value;
  const q = normalizar(termo.value.trim());
  if (q) lista = lista.filter((l) => normalizar(l.title).includes(q) || normalizar(l.author).includes(q));
  if (genero.value) lista = lista.filter((l) => l.genre === genero.value);
  if (soDisponiveis.value) lista = lista.filter((l) => l.situacao === 'disponivel');
  const copia = [...lista];
  switch (ordem.value) {
    case 'titulo':
      copia.sort((a, b) => a.title.localeCompare(b.title, 'pt'));
      break;
    case 'autor':
      copia.sort((a, b) => a.author.localeCompare(b.author, 'pt') || a.title.localeCompare(b.title, 'pt'));
      break;
    case 'ano':
      copia.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'pt'));
      break;
    case 'nota':
      copia.sort((a, b) => (b.notaMedia || 0) - (a.notaMedia || 0) || (b.totalAvaliacoes || 0) - (a.totalAvaliacoes || 0));
      break;
    default:
      break; // recentes: ordem da API
  }
  return copia;
});

const contagem = computed(() => {
  const mapa = { '': livros.value.length };
  for (const g of GENEROS) mapa[g] = livros.value.filter((l) => l.genre === g).length;
  return mapa;
});
const temFiltro = computed(() => Boolean(termo.value || genero.value || soDisponiveis.value || ordem.value !== 'recentes'));

function limpar() {
  termo.value = '';
  genero.value = '';
  ordem.value = 'recentes';
  soDisponiveis.value = false;
}
</script>

<template>
  <LayoutSite>
    <div class="conteiner pagina">
      <div class="pagina__cabecalho catalogo__cabecalho">
        <div>
          <span class="sobrelinha">Acervo</span>
          <h1>{{ genero || 'Catálogo' }}</h1>
          <p v-if="!carregando">
            {{ filtrados.length }} {{ filtrados.length === 1 ? 'título' : 'títulos' }}
            <template v-if="termo"> para “{{ termo }}”</template>
            <template v-if="soDisponiveis"> disponíveis agora</template>
          </p>
        </div>
      </div>

      <div class="ferramentas cartao">
        <label class="ferramentas__busca">
          <Icone nome="busca" :tamanho="18" />
          <input v-model="termo" type="search" placeholder="Filtrar por título ou autor" aria-label="Filtrar por título ou autor" />
        </label>
        <label class="ferramentas__ordem">
          <span>Ordenar por</span>
          <select v-model="ordem">
            <option v-for="o in ORDENS" :key="o.valor" :value="o.valor">{{ o.rotulo }}</option>
          </select>
        </label>
        <label class="ferramentas__alternar">
          <input v-model="soDisponiveis" type="checkbox" />
          <span class="alternar" aria-hidden="true" />
          <span>Só disponíveis</span>
        </label>
      </div>

      <div class="chips catalogo__generos" role="group" aria-label="Gênero">
        <button type="button" class="chip" :class="{ 'chip--ativo': !genero }" @click="genero = ''">
          Todos <small>{{ contagem[''] }}</small>
        </button>
        <button
          v-for="g in GENEROS"
          :key="g"
          type="button"
          class="chip"
          :class="{ 'chip--ativo': genero === g }"
          @click="genero = genero === g ? '' : g"
        >
          {{ g }} <small>{{ contagem[g] }}</small>
        </button>
      </div>

      <div v-if="carregando" class="grade-livros">
        <div v-for="i in 12" :key="i" class="esqueleto-livro">
          <span class="esqueleto esqueleto-livro__capa" />
          <span class="esqueleto esqueleto-livro__linha" />
          <span class="esqueleto esqueleto-livro__linha esqueleto-livro__linha--curta" />
        </div>
      </div>
      <div v-else-if="erro" class="aviso-caixa aviso-caixa--erro">
        <Icone nome="alerta" :tamanho="18" />
        <span>{{ erro }} <button type="button" class="link" @click="carregar">Tentar de novo</button></span>
      </div>
      <Vazio
        v-else-if="!filtrados.length"
        icone="busca"
        titulo="Nenhum livro com esses filtros"
        texto="Tente outro termo, outro gênero ou mostre também os livros que estão emprestados."
      >
        <button type="button" class="botao botao--secundario" @click="limpar">Limpar filtros</button>
      </Vazio>
      <div v-else class="grade-livros">
        <CartaoLivro v-for="l in filtrados" :key="l._id" :livro="l" />
      </div>

      <p v-if="temFiltro && !carregando && filtrados.length" class="texto-centro catalogo__limpar">
        <button type="button" class="botao botao--fantasma" @click="limpar"><Icone nome="x" :tamanho="16" /> Limpar filtros</button>
      </p>
    </div>
  </LayoutSite>
</template>

<style scoped>
.catalogo__cabecalho {
  margin-bottom: 20px;
}
.ferramentas {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.ferramentas__busca {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  color: var(--tinta-3);
}
.ferramentas__busca input {
  flex: 1;
  border: 0;
  outline: 0;
  padding: 10px 0;
  background: transparent;
  color: var(--tinta);
  min-width: 0;
}
.ferramentas__busca input::-webkit-search-cancel-button {
  cursor: pointer;
}
.ferramentas__ordem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--tinta-2);
}
.ferramentas__ordem select {
  padding: 8px 32px 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--linha-2);
  background: var(--superficie);
  font-weight: 500;
  color: var(--tinta);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234a5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.ferramentas__alternar {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--tinta-2);
  cursor: pointer;
  user-select: none;
  padding-right: 6px;
}
.ferramentas__alternar input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}
.alternar {
  width: 40px;
  height: 22px;
  border-radius: 999px;
  background: var(--linha-2);
  position: relative;
  transition: background 0.2s;
  flex: none;
}
.alternar::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s;
}
.ferramentas__alternar input:checked + .alternar {
  background: var(--verde);
}
.ferramentas__alternar input:checked + .alternar::after {
  transform: translateX(18px);
}
.ferramentas__alternar input:focus-visible + .alternar {
  outline: 3px solid rgba(42, 107, 102, 0.45);
  outline-offset: 2px;
}
.catalogo__generos {
  margin-bottom: 28px;
}
.chip small {
  opacity: 0.7;
  margin-left: 4px;
  font-size: 0.8em;
}
.catalogo__limpar {
  margin-top: 36px;
}
.esqueleto-livro {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.esqueleto-livro__capa {
  aspect-ratio: 2 / 3;
}
.esqueleto-livro__linha {
  height: 14px;
}
.esqueleto-livro__linha--curta {
  width: 60%;
}
.link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}
@media (max-width: 640px) {
  .ferramentas {
    padding: 8px;
  }
  .ferramentas__busca {
    width: 100%;
    flex-basis: 100%;
  }
}
</style>
