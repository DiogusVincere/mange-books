<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api, { mensagemDeErro } from '@/api';
import { sessao } from '@/sessao';
import { GENEROS } from '@/formato';
import LayoutSite from '@/components/layout/LayoutSite.vue';
import CartaoLivro from '@/components/livros/CartaoLivro.vue';
import Capa from '@/components/ui/Capa.vue';
import Icone from '@/components/ui/Icone.vue';

const router = useRouter();
const logado = sessao.logado;

const livros = ref([]);
const carregando = ref(true);
const erro = ref('');
const termo = ref('');

onMounted(carregar);

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const { data } = await api.get('/books');
    livros.value = data;
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível carregar o acervo.');
  } finally {
    carregando.value = false;
  }
}

// A API já devolve do mais recente para o mais antigo.
const recentes = computed(() => livros.value.slice(0, 8));
const bemAvaliados = computed(() =>
  livros.value
    .filter((l) => l.notaMedia)
    .sort((a, b) => b.notaMedia - a.notaMedia || b.totalAvaliacoes - a.totalAvaliacoes)
    .slice(0, 6),
);
const destaque = computed(() => {
  const base = bemAvaliados.value.length >= 5 ? bemAvaliados.value : livros.value;
  return base.filter((l) => l.coverImage).slice(0, 5);
});
const porGenero = computed(() =>
  GENEROS.map((g) => {
    const lista = livros.value.filter((l) => l.genre === g);
    return { nome: g, total: lista.length, capas: lista.slice(0, 3) };
  }),
);
const disponiveis = computed(() => livros.value.filter((l) => l.situacao === 'disponivel').length);
const totalAvaliacoes = computed(() => livros.value.reduce((soma, l) => soma + (l.totalAvaliacoes || 0), 0));

function buscar() {
  const q = termo.value.trim();
  router.push({ name: 'catalogo', query: q ? { q } : {} });
}
</script>

<template>
  <LayoutSite>
    <!-- Vitrine -->
    <section class="hero">
      <div class="conteiner hero__grade">
        <div class="hero__texto">
          <span class="sobrelinha sobrelinha--clara">Biblioteca Mange Books</span>
          <h1>Encontre, reserve<br />e leia.</h1>
          <p>
            Um acervo com {{ livros.length || 'dezenas de' }} títulos em seis gêneros. Veja o que está disponível,
            leia as avaliações de outros leitores e reserve pelo site para retirar no balcão.
          </p>
          <form class="hero__busca" role="search" @submit.prevent="buscar">
            <Icone nome="busca" :tamanho="20" />
            <input v-model="termo" type="search" placeholder="Que livro você procura?" aria-label="Buscar no catálogo" />
            <button type="submit" class="botao botao--ambar">Buscar</button>
          </form>
          <div class="hero__chips">
            <RouterLink v-for="g in GENEROS" :key="g" :to="{ name: 'catalogo', query: { genero: g } }" class="hero__chip">{{ g }}</RouterLink>
          </div>
          <dl class="hero__numeros">
            <div><dt>{{ livros.length }}</dt><dd>títulos</dd></div>
            <div><dt>{{ disponiveis }}</dt><dd>disponíveis agora</dd></div>
            <div><dt>{{ totalAvaliacoes }}</dt><dd>avaliações de leitores</dd></div>
          </dl>
        </div>

        <div class="hero__pilha">
          <template v-if="destaque.length">
            <RouterLink
              v-for="(l, i) in destaque"
              :key="l._id"
              :to="{ name: 'livro', params: { id: l._id } }"
              class="hero__livro"
              :class="`hero__livro--${i + 1}`"
              :title="l.title"
            >
              <Capa :src="l.coverImage" :titulo="l.title" :autor="l.author" tamanho="L" prioritaria />
            </RouterLink>
          </template>
          <template v-else>
            <span v-for="i in 5" :key="i" class="hero__livro hero__livro--vazio esqueleto" :class="`hero__livro--${i}`" />
          </template>
        </div>
      </div>
    </section>

    <!-- Novidades -->
    <section class="secao">
      <div class="conteiner">
        <div class="secao__cabecalho">
          <div>
            <span class="sobrelinha">Novidades</span>
            <h2>Chegaram agora no acervo</h2>
          </div>
          <RouterLink :to="{ name: 'catalogo' }" class="botao botao--secundario">
            Ver catálogo completo <Icone nome="seta-dir" :tamanho="16" />
          </RouterLink>
        </div>

        <div v-if="carregando" class="grade-livros">
          <div v-for="i in 8" :key="i" class="esqueleto-livro">
            <span class="esqueleto esqueleto-livro__capa" />
            <span class="esqueleto esqueleto-livro__linha" />
            <span class="esqueleto esqueleto-livro__linha esqueleto-livro__linha--curta" />
          </div>
        </div>
        <div v-else-if="erro" class="aviso-caixa aviso-caixa--erro">
          <Icone nome="alerta" :tamanho="18" />
          <span>{{ erro }} <button type="button" class="link" @click="carregar">Tentar de novo</button></span>
        </div>
        <div v-else class="grade-livros">
          <CartaoLivro v-for="l in recentes" :key="l._id" :livro="l" />
        </div>
      </div>
    </section>

    <!-- Gêneros -->
    <section class="secao secao--alt">
      <div class="conteiner">
        <div class="secao__cabecalho">
          <div>
            <span class="sobrelinha">Explore</span>
            <h2>Encontre a sua estante</h2>
            <p>Seis gêneros para começar. Clique e veja só o que interessa.</p>
          </div>
        </div>
        <div class="generos">
          <RouterLink
            v-for="g in porGenero"
            :key="g.nome"
            :to="{ name: 'catalogo', query: { genero: g.nome } }"
            class="genero"
          >
            <div class="genero__capas" aria-hidden="true">
              <Capa v-for="l in g.capas" :key="l._id" :src="l.coverImage" :titulo="l.title" tamanho="M" />
              <span v-if="!g.capas.length" class="genero__capa-vazia" />
            </div>
            <div class="genero__texto">
              <h3>{{ g.nome }}</h3>
              <span>{{ g.total }} {{ g.total === 1 ? 'título' : 'títulos' }}</span>
            </div>
            <Icone nome="seta-dir" :tamanho="20" class="genero__seta" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Mais bem avaliados -->
    <section v-if="bemAvaliados.length" class="secao">
      <div class="conteiner">
        <div class="secao__cabecalho">
          <div>
            <span class="sobrelinha">Avaliados pelos leitores</span>
            <h2>Os mais bem avaliados</h2>
          </div>
          <RouterLink :to="{ name: 'catalogo', query: { ordem: 'nota' } }" class="botao botao--secundario">
            Ver ranking completo <Icone nome="seta-dir" :tamanho="16" />
          </RouterLink>
        </div>
        <div class="grade-livros">
          <CartaoLivro v-for="l in bemAvaliados" :key="l._id" :livro="l" />
        </div>
      </div>
    </section>

    <!-- Como funciona -->
    <section class="secao secao--alt">
      <div class="conteiner">
        <div class="secao__cabecalho">
          <div>
            <span class="sobrelinha">Como funciona</span>
            <h2>Do catálogo à sua mão em três passos</h2>
          </div>
        </div>
        <ol class="passos">
          <li>
            <span class="passo__num">1</span>
            <Icone nome="usuario" :tamanho="26" />
            <h3>Crie sua conta</h3>
            <p>Leva um minuto. Com ela você reserva livros e avalia o que leu.</p>
          </li>
          <li>
            <span class="passo__num">2</span>
            <Icone nome="marcador" :tamanho="26" />
            <h3>Reserve pelo site</h3>
            <p>Escolha um título disponível e reserve. Ele fica guardado para você, até três por vez.</p>
          </li>
          <li>
            <span class="passo__num">3</span>
            <Icone nome="livro-aberto" :tamanho="26" />
            <h3>Retire e leia</h3>
            <p>Passe no balcão para retirar. Depois, conte para os outros leitores o que achou.</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Chamada -->
    <section v-if="!logado" class="chamada">
      <div class="conteiner">
        <div class="chamada__caixa">
          <div>
            <h2>Pronto para a próxima leitura?</h2>
            <p>Crie sua conta gratuita e reserve seu primeiro livro hoje.</p>
          </div>
          <div class="chamada__botoes">
            <RouterLink :to="{ name: 'cadastro' }" class="botao botao--ambar botao--grande">Criar conta</RouterLink>
            <RouterLink :to="{ name: 'entrar' }" class="botao botao--contorno-claro botao--grande">Já tenho conta</RouterLink>
          </div>
        </div>
      </div>
    </section>
  </LayoutSite>
</template>

<style scoped>
/* Vitrine */
.hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(900px 500px at 85% -10%, rgba(217, 150, 43, 0.22), transparent 60%),
    radial-gradient(700px 400px at -10% 110%, rgba(61, 138, 131, 0.35), transparent 60%),
    linear-gradient(135deg, #163f3c 0%, #1e4d4a 55%, #23605b 100%);
}
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5), transparent 70%);
  pointer-events: none;
}
.hero__grade {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 40px;
  align-items: center;
  min-height: 580px;
  padding-block: 64px;
}
.sobrelinha--clara {
  color: var(--ambar);
}
.hero h1 {
  color: #fff;
  font-size: clamp(2.6rem, 2rem + 3vw, 4.4rem);
  margin-bottom: 18px;
}
.hero__texto > p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.82);
  max-width: 540px;
}
.hero__busca {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 999px;
  padding: 6px 6px 6px 18px;
  max-width: 560px;
  box-shadow: var(--sombra-2);
  margin-top: 26px;
  color: var(--tinta-3);
}
.hero__busca input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  padding: 10px 4px;
  background: transparent;
  color: var(--tinta);
  font-size: 1rem;
}
.hero__busca input::-webkit-search-cancel-button {
  cursor: pointer;
}
.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.hero__chip {
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none !important;
  transition: background 0.15s;
}
.hero__chip:hover {
  background: rgba(255, 255, 255, 0.14);
}
.hero__numeros {
  display: flex;
  gap: 40px;
  margin: 40px 0 0;
  flex-wrap: wrap;
}
.hero__numeros dt {
  font-family: var(--fonte-titulo);
  font-size: 2.2rem;
  font-weight: 600;
  line-height: 1;
}
.hero__numeros dd {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}
.hero__pilha {
  position: relative;
  height: 470px;
}
.hero__livro {
  position: absolute;
  display: block;
  width: 190px;
  border-radius: 10px;
  filter: drop-shadow(0 30px 40px rgba(0, 0, 0, 0.45));
  transition: filter 0.3s ease;
}
.hero__livro :deep(.capa) {
  transition: transform 0.3s ease;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.hero__livro:hover {
  z-index: 10 !important;
  filter: drop-shadow(0 40px 50px rgba(0, 0, 0, 0.55));
}
.hero__livro:hover :deep(.capa) {
  transform: translateY(-12px) scale(1.04);
}
.hero__livro--1 {
  left: 50%;
  top: 0;
  width: 232px;
  transform: translateX(-50%);
  z-index: 5;
}
.hero__livro--2 {
  left: 2%;
  top: 70px;
  transform: rotate(-9deg);
  z-index: 4;
}
.hero__livro--3 {
  right: 1%;
  top: 60px;
  transform: rotate(8deg);
  z-index: 3;
}
.hero__livro--4 {
  left: 17%;
  bottom: 0;
  width: 150px;
  transform: rotate(-4deg);
  z-index: 2;
}
.hero__livro--5 {
  right: 16%;
  bottom: -4px;
  width: 150px;
  transform: rotate(5deg);
  z-index: 1;
}
.hero__livro--vazio {
  aspect-ratio: 2 / 3;
  opacity: 0.35;
}

/* Esqueleto dos cartões */
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

/* Gêneros */
.generos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.genero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  border-radius: var(--raio);
  background: var(--papel);
  border: 1px solid var(--linha);
  color: inherit;
  text-decoration: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
}
.genero:hover {
  transform: translateY(-3px);
  box-shadow: var(--sombra-1);
  border-color: var(--linha-2);
}
.genero__capas {
  display: flex;
  flex: none;
  padding-left: 12px;
}
.genero__capas :deep(.capa),
.genero__capa-vazia {
  width: 48px;
  margin-left: -14px;
  border-radius: 5px;
  box-shadow: 0 6px 14px -6px rgba(27, 36, 48, 0.5);
  transition: transform 0.2s ease;
}
.genero__capa-vazia {
  aspect-ratio: 2 / 3;
  background: var(--papel-2);
}
.genero__capas :deep(.capa:nth-child(1)) {
  transform: rotate(-8deg) translateY(4px);
}
.genero__capas :deep(.capa:nth-child(3)) {
  transform: rotate(8deg) translateY(4px);
}
.genero:hover .genero__capas :deep(.capa:nth-child(1)) {
  transform: rotate(-12deg) translate(-4px, 2px);
}
.genero:hover .genero__capas :deep(.capa:nth-child(3)) {
  transform: rotate(12deg) translate(4px, 2px);
}
.genero__texto {
  flex: 1;
  min-width: 0;
}
.genero__texto h3 {
  margin: 0 0 2px;
  font-size: 1.25rem;
}
.genero__texto span {
  color: var(--tinta-2);
  font-size: 0.88rem;
}
.genero__seta {
  color: var(--tinta-3);
  transition: transform 0.2s, color 0.2s;
}
.genero:hover .genero__seta {
  transform: translateX(4px);
  color: var(--verde);
}

/* Passos */
.passos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.passos li {
  position: relative;
  padding: 28px 24px 22px;
  border-radius: var(--raio);
  background: var(--papel);
  border: 1px solid var(--linha);
}
.passo__num {
  position: absolute;
  top: 14px;
  right: 20px;
  font-family: var(--fonte-titulo);
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--linha-2);
  line-height: 1;
}
.passos svg {
  color: var(--verde);
  margin-bottom: 14px;
}
.passos h3 {
  font-size: 1.15rem;
  margin-bottom: 6px;
}
.passos p {
  margin: 0;
  color: var(--tinta-2);
  font-size: 0.95rem;
}

/* Chamada */
.chamada {
  padding-block: 56px 80px;
}
.chamada__caixa {
  background: linear-gradient(120deg, var(--verde), var(--verde-2));
  color: #fff;
  border-radius: var(--raio-g);
  padding: 44px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: var(--sombra-2);
}
.chamada h2 {
  color: #fff;
  margin-bottom: 6px;
}
.chamada p {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
}
.chamada__botoes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .generos,
  .passos {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 900px) {
  .hero__grade {
    grid-template-columns: 1fr;
    min-height: 0;
    padding-block: 48px 40px;
    gap: 36px;
  }
  .hero__pilha {
    height: 320px;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }
  .hero__livro {
    width: 130px;
  }
  .hero__livro--1 {
    width: 160px;
  }
  .hero__livro--4,
  .hero__livro--5 {
    width: 105px;
  }
}
@media (max-width: 640px) {
  .generos,
  .passos {
    grid-template-columns: 1fr;
  }
  .hero__numeros {
    gap: 24px;
  }
  .hero__busca .botao {
    padding-inline: 14px;
  }
  .chamada__caixa {
    padding: 32px 24px;
  }
}
</style>
