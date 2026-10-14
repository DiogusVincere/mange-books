<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { mensagemDeErro } from '@/api';
import { sessao } from '@/sessao';
import { avisar } from '@/avisos';
import { confirmar } from '@/confirmar';
import { SITUACOES, dataRelativa, data as formatarData } from '@/formato';
import LayoutSite from '@/components/layout/LayoutSite.vue';
import CartaoLivro from '@/components/livros/CartaoLivro.vue';
import Capa from '@/components/ui/Capa.vue';
import Estrelas from '@/components/ui/Estrelas.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const props = defineProps({ id: { type: String, required: true } });
const route = useRoute();
const router = useRouter();

const logado = sessao.logado;
const bibliotecario = sessao.bibliotecario;
const usuario = computed(() => sessao.estado.usuario);

const livro = ref(null);
const avaliacoes = ref([]);
const parecidos = ref([]);
const carregando = ref(true);
const erro = ref('');
const reservando = ref(false);
const enviando = ref(false);
const form = reactive({ rating: 0, comment: '' });

onMounted(() => sessao.carregar());
watch(() => props.id, carregar, { immediate: true });

async function carregar() {
  carregando.value = true;
  erro.value = '';
  livro.value = null;
  try {
    const [l, a] = await Promise.all([api.get(`/books/${props.id}`), api.get(`/reviews/${props.id}`)]);
    livro.value = l.data;
    avaliacoes.value = a.data;
    document.title = `${l.data.title} · Mange Books`;
    const { data: lista } = await api.get('/books', { params: { genero: l.data.genre, limite: 7 } });
    parecidos.value = lista.filter((x) => x._id !== l.data._id).slice(0, 6);
  } catch (e) {
    erro.value = e.response && e.response.status === 404 ? 'Este livro não existe ou foi removido do acervo.' : mensagemDeErro(e);
  } finally {
    carregando.value = false;
  }
}

// Recarrega só o que muda depois de uma ação (nota, situação, reserva, avaliações)
async function atualizar() {
  const [l, a] = await Promise.all([api.get(`/books/${props.id}`), api.get(`/reviews/${props.id}`)]);
  livro.value = l.data;
  avaliacoes.value = a.data;
}

const minhaAvaliacao = computed(() =>
  usuario.value ? avaliacoes.value.find((a) => String(a.userId) === String(usuario.value._id)) : null,
);
watch(
  minhaAvaliacao,
  (m) => {
    if (m) {
      form.rating = m.rating;
      form.comment = m.comment;
    }
  },
  { immediate: true },
);

const situacao = computed(() => (livro.value ? SITUACOES[livro.value.situacao] || SITUACOES.disponivel : null));
const estadoReserva = computed(() => {
  const l = livro.value;
  if (!l) return 'carregando';
  if (l.minhaReserva) return l.minhaReserva.status === 'Emprestado' ? 'comigo' : 'minha';
  if (l.situacao === 'disponivel') return 'livre';
  return 'ocupado';
});
const paragrafos = computed(() => (livro.value ? String(livro.value.description || '').split(/\n+/).filter(Boolean) : []));
const podeExcluir = (a) => (usuario.value && String(a.userId) === String(usuario.value._id)) || bibliotecario.value;

async function reservar() {
  if (!logado.value) {
    router.push({ name: 'entrar', query: { redirect: route.fullPath } });
    return;
  }
  reservando.value = true;
  try {
    const { data } = await api.post('/api/reservations/reserve', { bookId: livro.value._id });
    avisar(data.message || 'Livro reservado!');
    await atualizar();
  } catch (e) {
    avisar(mensagemDeErro(e, 'Não foi possível reservar.'), 'erro');
  } finally {
    reservando.value = false;
  }
}

async function cancelarReserva() {
  const ok = await confirmar({
    titulo: 'Cancelar a reserva?',
    texto: `"${livro.value.title}" volta a ficar disponível para outros leitores.`,
    confirmar: 'Cancelar reserva',
    cancelar: 'Manter',
    perigo: true,
  });
  if (!ok) return;
  reservando.value = true;
  try {
    await api.post('/api/reservations/cancel', { reservationId: livro.value.minhaReserva._id });
    avisar('Reserva cancelada.', 'info');
    await atualizar();
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    reservando.value = false;
  }
}

async function enviarAvaliacao() {
  if (!form.rating) {
    avisar('Escolha uma nota de 1 a 5 estrelas.', 'aviso');
    return;
  }
  enviando.value = true;
  try {
    const { data } = await api.post('/reviews/create', {
      bookId: livro.value._id,
      rating: form.rating,
      comment: form.comment,
    });
    avisar(data.message || 'Avaliação enviada!');
    await atualizar();
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    enviando.value = false;
  }
}

async function excluirAvaliacao(a) {
  const minha = usuario.value && String(a.userId) === String(usuario.value._id);
  const ok = await confirmar({
    titulo: 'Excluir avaliação?',
    texto: minha ? 'A sua avaliação será removida deste livro.' : `A avaliação de ${a.userName} será removida.`,
    confirmar: 'Excluir',
    perigo: true,
  });
  if (!ok) return;
  try {
    await api.delete(`/reviews/${a._id}`);
    if (minha) {
      form.rating = 0;
      form.comment = '';
    }
    avisar('Avaliação excluída.', 'info');
    await atualizar();
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  }
}
</script>

<template>
  <LayoutSite>
    <div class="conteiner pagina">
      <!-- Carregando -->
      <div v-if="carregando" class="livro">
        <div class="esqueleto livro__capa-esqueleto" />
        <div class="livro__esqueleto-texto">
          <span class="esqueleto" style="width: 90px; height: 24px" />
          <span class="esqueleto" style="width: 70%; height: 44px" />
          <span class="esqueleto" style="width: 40%; height: 20px" />
          <span class="esqueleto" style="width: 100%; height: 120px; margin-top: 20px" />
        </div>
      </div>

      <!-- Erro -->
      <Vazio v-else-if="erro" icone="alerta" titulo="Ops" :texto="erro">
        <RouterLink :to="{ name: 'catalogo' }" class="botao botao--primario">Voltar ao catálogo</RouterLink>
      </Vazio>

      <!-- Livro -->
      <template v-else-if="livro">
        <nav class="migalhas" aria-label="Você está em">
          <RouterLink :to="{ name: 'inicio' }">Início</RouterLink>
          <span>/</span>
          <RouterLink :to="{ name: 'catalogo' }">Catálogo</RouterLink>
          <span>/</span>
          <RouterLink :to="{ name: 'catalogo', query: { genero: livro.genre } }">{{ livro.genre }}</RouterLink>
        </nav>

        <article class="livro">
          <aside class="livro__lado">
            <Capa :src="livro.coverImage" :titulo="livro.title" :autor="livro.author" tamanho="L" prioritaria class="livro__capa" />
            <div class="livro__situacao">
              <span class="selo selo--ponto" :class="situacao.classe">{{ situacao.rotulo }}</span>
            </div>
          </aside>

          <div class="livro__corpo">
            <div class="livro__topo">
              <RouterLink :to="{ name: 'catalogo', query: { genero: livro.genre } }" class="selo selo--cinza">{{ livro.genre }}</RouterLink>
              <RouterLink v-if="bibliotecario" :to="{ name: 'painel-livro-editar', params: { id: livro._id } }" class="botao botao--fantasma botao--pequeno">
                <Icone nome="editar" :tamanho="15" /> Editar livro
              </RouterLink>
            </div>
            <h1 class="livro__titulo">{{ livro.title }}</h1>
            <p class="livro__autor">
              por <RouterLink :to="{ name: 'catalogo', query: { q: livro.author } }">{{ livro.author }}</RouterLink>
            </p>

            <a href="#avaliacoes" class="livro__nota">
              <Estrelas :valor="livro.notaMedia || 0" :tamanho="18" />
              <strong v-if="livro.notaMedia">{{ livro.notaMedia.toFixed(1) }}</strong>
              <span class="texto-suave">
                {{ livro.totalAvaliacoes ? `${livro.totalAvaliacoes} ${livro.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}` : 'Ainda sem avaliações' }}
              </span>
            </a>

            <dl class="livro__meta">
              <div><dt><Icone nome="calendario" :tamanho="15" /> Ano</dt><dd>{{ livro.year }}</dd></div>
              <div><dt><Icone nome="paginas" :tamanho="15" /> Páginas</dt><dd>{{ livro.pageCount }}</dd></div>
              <div><dt><Icone nome="livro" :tamanho="15" /> Capa</dt><dd>{{ livro.coverType }}</dd></div>
              <div><dt><Icone nome="codigo" :tamanho="15" /> ISBN</dt><dd>{{ livro.isbn }}</dd></div>
            </dl>

            <!-- Reserva -->
            <div class="reserva cartao">
              <template v-if="estadoReserva === 'livre'">
                <div class="reserva__texto">
                  <strong>Disponível para reserva</strong>
                  <span>Reserve agora e retire no balcão da biblioteca. Até três reservas por leitor.</span>
                </div>
                <button type="button" class="botao botao--primario botao--grande" :disabled="reservando" @click="reservar">
                  <Icone nome="marcador" :tamanho="18" />
                  {{ logado ? (reservando ? 'Reservando…' : 'Reservar este livro') : 'Entrar para reservar' }}
                </button>
              </template>
              <template v-else-if="estadoReserva === 'minha'">
                <div class="reserva__texto">
                  <strong><Icone nome="check" :tamanho="16" /> Você reservou este livro</strong>
                  <span>Ele está guardado para você. Passe no balcão para retirar.</span>
                </div>
                <div class="reserva__botoes">
                  <RouterLink :to="{ name: 'minhas-reservas' }" class="botao botao--secundario">Minhas reservas</RouterLink>
                  <button type="button" class="botao botao--perigo" :disabled="reservando" @click="cancelarReserva">Cancelar reserva</button>
                </div>
              </template>
              <template v-else-if="estadoReserva === 'comigo'">
                <div class="reserva__texto">
                  <strong><Icone nome="livro-aberto" :tamanho="16" /> Este livro está com você</strong>
                  <span>Boa leitura! Quando terminar, devolva no balcão e deixe sua avaliação aqui embaixo.</span>
                </div>
                <RouterLink :to="{ name: 'minhas-reservas' }" class="botao botao--secundario">Minhas reservas</RouterLink>
              </template>
              <template v-else>
                <div class="reserva__texto">
                  <strong>{{ livro.situacao === 'emprestado' ? 'Emprestado no momento' : 'Reservado por outro leitor' }}</strong>
                  <span>Assim que for devolvido, ele volta a aparecer como disponível aqui no catálogo.</span>
                </div>
                <RouterLink :to="{ name: 'catalogo', query: { genero: livro.genre, disponiveis: '1' } }" class="botao botao--secundario">
                  Ver {{ livro.genre }} disponíveis
                </RouterLink>
              </template>
            </div>

            <section class="livro__descricao">
              <h2>Sobre o livro</h2>
              <p v-for="(p, i) in paragrafos" :key="i">{{ p }}</p>
            </section>
          </div>
        </article>

        <!-- Avaliações -->
        <section id="avaliacoes" class="avaliacoes">
          <div class="secao__cabecalho">
            <div>
              <span class="sobrelinha">Opinião dos leitores</span>
              <h2>Avaliações</h2>
            </div>
            <div v-if="livro.totalAvaliacoes" class="avaliacoes__resumo">
              <strong>{{ livro.notaMedia.toFixed(1) }}</strong>
              <div>
                <Estrelas :valor="livro.notaMedia" :tamanho="16" />
                <small>{{ livro.totalAvaliacoes }} {{ livro.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações' }}</small>
              </div>
            </div>
          </div>

          <div class="avaliacoes__grade">
            <div class="avaliacoes__form">
              <form v-if="logado" class="cartao cartao--recheio" @submit.prevent="enviarAvaliacao">
                <h3>{{ minhaAvaliacao ? 'Atualizar minha avaliação' : 'Deixe sua avaliação' }}</h3>
                <div class="campo">
                  <span class="campo__rotulo">Sua nota</span>
                  <div class="avaliacoes__estrelas">
                    <Estrelas v-model:valor="form.rating" editavel :tamanho="30" />
                    <span class="texto-suave">{{ ['', 'Ruim', 'Fraco', 'Bom', 'Muito bom', 'Excelente'][form.rating] || 'Toque nas estrelas' }}</span>
                  </div>
                </div>
                <div class="campo">
                  <label for="comentario">Comentário <span class="texto-fraco">(opcional)</span></label>
                  <textarea id="comentario" v-model="form.comment" rows="4" maxlength="1000" placeholder="O que você achou? Sem spoilers, por favor."></textarea>
                  <span class="campo__dica">{{ form.comment.length }}/1000</span>
                </div>
                <button type="submit" class="botao botao--primario" :disabled="enviando">
                  {{ enviando ? 'Enviando…' : minhaAvaliacao ? 'Salvar alterações' : 'Publicar avaliação' }}
                </button>
              </form>
              <div v-else class="cartao cartao--recheio avaliacoes__entrar">
                <Icone nome="estrela" :tamanho="28" />
                <h3>Leu este livro?</h3>
                <p class="texto-suave">Entre na sua conta para dar uma nota e contar o que achou.</p>
                <RouterLink :to="{ name: 'entrar', query: { redirect: route.fullPath } }" class="botao botao--primario">Entrar para avaliar</RouterLink>
              </div>
            </div>

            <div class="avaliacoes__lista">
              <Vazio
                v-if="!avaliacoes.length"
                compacto
                icone="estrela"
                titulo="Ninguém avaliou ainda"
                texto="Seja a primeira pessoa a contar o que achou deste livro."
              />
              <article v-for="a in avaliacoes" :key="a._id" class="avaliacao cartao">
                <header class="avaliacao__topo">
                  <Avatar :nome="a.userName" :tamanho="40" />
                  <div class="avaliacao__quem">
                    <strong>{{ a.userName }}<span v-if="usuario && String(a.userId) === String(usuario._id)" class="selo selo--verde">você</span></strong>
                    <small :title="formatarData(a.createdAt)">{{ dataRelativa(a.createdAt) }}</small>
                  </div>
                  <Estrelas :valor="a.rating" :tamanho="15" />
                  <button
                    v-if="podeExcluir(a)"
                    type="button"
                    class="avaliacao__excluir"
                    title="Excluir avaliação"
                    aria-label="Excluir avaliação"
                    @click="excluirAvaliacao(a)"
                  >
                    <Icone nome="lixeira" :tamanho="16" />
                  </button>
                </header>
                <p v-if="a.comment" class="avaliacao__texto">{{ a.comment }}</p>
              </article>
            </div>
          </div>
        </section>

        <!-- Do mesmo gênero -->
        <section v-if="parecidos.length" class="parecidos">
          <div class="secao__cabecalho">
            <div>
              <span class="sobrelinha">Para continuar</span>
              <h2>Mais {{ livro.genre }}</h2>
            </div>
            <RouterLink :to="{ name: 'catalogo', query: { genero: livro.genre } }" class="botao botao--secundario">
              Ver todos <Icone nome="seta-dir" :tamanho="16" />
            </RouterLink>
          </div>
          <div class="grade-livros">
            <CartaoLivro v-for="l in parecidos" :key="l._id" :livro="l" />
          </div>
        </section>
      </template>
    </div>
  </LayoutSite>
</template>

<style scoped>
.migalhas {
  display: flex;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--tinta-3);
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.migalhas a {
  color: var(--tinta-2);
}
.livro {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 48px;
  align-items: start;
}
.livro__lado {
  position: sticky;
  top: 96px;
}
.livro__capa {
  border-radius: 12px;
  box-shadow: var(--sombra-2);
}
.livro__capa-esqueleto {
  aspect-ratio: 2 / 3;
  border-radius: 12px;
}
.livro__esqueleto-texto {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.livro__situacao {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
.livro__situacao .selo {
  font-size: 0.85rem;
  padding: 6px 14px;
}
.livro__topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.livro__topo .selo {
  text-decoration: none;
}
.livro__titulo {
  margin-bottom: 6px;
}
.livro__autor {
  font-size: 1.15rem;
  color: var(--tinta-2);
  margin-bottom: 14px;
}
.livro__autor a {
  font-weight: 600;
}
.livro__nota {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  margin-bottom: 22px;
}
.livro__nota strong {
  font-size: 1.1rem;
}
.livro__nota:hover .texto-suave {
  text-decoration: underline;
}
.livro__meta {
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: 12px 28px;
  margin: 0 0 24px;
  padding: 16px 20px;
  border-radius: var(--raio);
  background: var(--superficie);
  border: 1px solid var(--linha);
  justify-content: start;
}
.livro__meta dt {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--tinta-3);
  font-weight: 600;
}
.livro__meta dd {
  margin: 4px 0 0;
  font-weight: 600;
}
.reserva {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  border-left: 5px solid var(--verde);
}
.reserva__texto {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 220px;
}
.reserva__texto strong {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
}
.reserva__texto span {
  color: var(--tinta-2);
  font-size: 0.93rem;
}
.reserva__botoes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.livro__descricao h2 {
  font-size: 1.5rem;
}
.livro__descricao p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--tinta-2);
  max-width: 68ch;
}

/* Avaliações */
.avaliacoes {
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid var(--linha);
}
.avaliacoes__resumo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avaliacoes__resumo strong {
  font-family: var(--fonte-titulo);
  font-size: 2.4rem;
  line-height: 1;
}
.avaliacoes__resumo div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.avaliacoes__resumo small {
  color: var(--tinta-3);
}
.avaliacoes__grade {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 32px;
  align-items: start;
}
.avaliacoes__form {
  position: sticky;
  top: 96px;
}
.avaliacoes__form h3 {
  font-size: 1.2rem;
}
.avaliacoes__estrelas {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.avaliacoes__entrar {
  text-align: center;
}
.avaliacoes__entrar svg {
  color: var(--ambar);
  margin: 0 auto 10px;
}
.avaliacoes__entrar h3 {
  margin-bottom: 6px;
}
.avaliacoes__lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.avaliacao {
  padding: 18px 20px;
}
.avaliacao__topo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avaliacao__quem {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.avaliacao__quem strong {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avaliacao__quem small {
  color: var(--tinta-3);
}
.avaliacao__excluir {
  color: var(--tinta-3);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.avaliacao__excluir:hover {
  background: var(--vermelho-claro);
  color: var(--vermelho);
}
.avaliacao__texto {
  margin: 12px 0 0 52px;
  color: var(--tinta-2);
  line-height: 1.6;
}
.parecidos {
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid var(--linha);
}

@media (max-width: 960px) {
  .livro {
    grid-template-columns: 240px 1fr;
    gap: 32px;
  }
  .livro__meta {
    grid-template-columns: repeat(2, auto);
  }
  .avaliacoes__grade {
    grid-template-columns: 1fr;
  }
  .avaliacoes__form {
    position: static;
  }
}
@media (max-width: 680px) {
  .livro {
    grid-template-columns: 1fr;
  }
  .livro__lado {
    position: static;
    max-width: 240px;
    margin: 0 auto;
  }
  .avaliacao__texto {
    margin-left: 0;
  }
}
</style>
