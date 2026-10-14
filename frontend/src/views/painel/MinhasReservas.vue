<script setup>
import { ref, computed, onMounted } from 'vue';
import api, { mensagemDeErro } from '@/api';
import { avisar } from '@/avisos';
import { confirmar } from '@/confirmar';
import { data as formatarData, STATUS_RESERVA } from '@/formato';
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import Capa from '@/components/ui/Capa.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const reservas = ref([]);
const carregando = ref(true);
const erro = ref('');
const aba = ref('abertas');
const ocupado = ref('');

onMounted(carregar);

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const { data } = await api.get('/api/reservations');
    reservas.value = data;
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível carregar as reservas.');
  } finally {
    carregando.value = false;
  }
}

const abertas = computed(() => reservas.value.filter((r) => ['Reservado', 'Emprestado'].includes(r.status)));
const historico = computed(() => reservas.value.filter((r) => ['Devolvido', 'Cancelado'].includes(r.status)));
const lista = computed(() => (aba.value === 'abertas' ? abertas.value : historico.value));

async function cancelar(r) {
  const ok = await confirmar({
    titulo: 'Cancelar a reserva?',
    texto: `"${r.book.title}" volta a ficar disponível para outros leitores.`,
    confirmar: 'Cancelar reserva',
    cancelar: 'Manter',
    perigo: true,
  });
  if (!ok) return;
  ocupado.value = r._id;
  try {
    await api.post('/api/reservations/cancel', { reservationId: r._id });
    avisar('Reserva cancelada.', 'info');
    await carregar();
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    ocupado.value = '';
  }
}

function etapas(r) {
  const lista = [{ rotulo: 'Reservado', data: r.reservedAt, feito: true }];
  if (r.status === 'Cancelado') {
    lista.push({ rotulo: 'Cancelado', data: r.canceledAt, feito: true, cancelado: true });
    return lista;
  }
  lista.push({ rotulo: 'Retirado', data: r.loanedAt, feito: Boolean(r.loanedAt) });
  lista.push({ rotulo: 'Devolvido', data: r.returnedAt, feito: Boolean(r.returnedAt) });
  return lista;
}
</script>

<template>
  <LayoutPainel titulo="Minhas reservas" subtitulo="Acompanhe reservas, retiradas e devoluções">
    <template #acoes>
      <RouterLink :to="{ name: 'catalogo', query: { disponiveis: '1' } }" class="botao botao--primario"><Icone nome="mais" :tamanho="16" /> Reservar outro livro</RouterLink>
    </template>

    <div class="abas" role="tablist">
      <button type="button" role="tab" class="aba" :class="{ 'aba--ativa': aba === 'abertas' }" :aria-selected="aba === 'abertas'" @click="aba = 'abertas'">
        Em aberto <span class="aba__contador">{{ abertas.length }}</span>
      </button>
      <button type="button" role="tab" class="aba" :class="{ 'aba--ativa': aba === 'historico' }" :aria-selected="aba === 'historico'" @click="aba = 'historico'">
        Histórico <span class="aba__contador">{{ historico.length }}</span>
      </button>
    </div>

    <div v-if="carregando" class="lista">
      <span v-for="i in 3" :key="i" class="esqueleto" style="height: 120px" />
    </div>
    <div v-else-if="erro" class="aviso-caixa aviso-caixa--erro"><Icone nome="alerta" :tamanho="18" /> <span>{{ erro }} <button type="button" class="link" @click="carregar">Tentar de novo</button></span></div>
    <Vazio
      v-else-if="!lista.length"
      :icone="aba === 'abertas' ? 'marcador' : 'relogio'"
      :titulo="aba === 'abertas' ? 'Nenhuma reserva em aberto' : 'Nenhum registro no histórico'"
      :texto="aba === 'abertas' ? 'Reserve um livro disponível no catálogo. Você pode ter até três em aberto.' : 'Quando você devolver um livro, ele aparece aqui.'"
    >
      <RouterLink :to="{ name: 'catalogo', query: { disponiveis: '1' } }" class="botao botao--primario">Ver livros disponíveis</RouterLink>
    </Vazio>
    <div v-else class="lista">
      <article v-for="r in lista" :key="r._id" class="reserva cartao">
        <RouterLink :to="{ name: 'livro', params: { id: r.book._id } }" class="reserva__capa">
          <Capa :src="r.book.coverImage" :titulo="r.book.title" tamanho="M" />
        </RouterLink>
        <div class="reserva__corpo">
          <div class="reserva__topo">
            <div>
              <RouterLink :to="{ name: 'livro', params: { id: r.book._id } }" class="reserva__titulo">{{ r.book.title }}</RouterLink>
              <p class="texto-suave sem-margem">{{ r.book.author }} · {{ r.book.genre }}</p>
            </div>
            <span class="selo selo--ponto" :class="STATUS_RESERVA[r.status].classe">{{ STATUS_RESERVA[r.status].rotulo }}</span>
          </div>
          <ol class="etapas">
            <li v-for="e in etapas(r)" :key="e.rotulo" :class="{ 'etapa--feita': e.feito, 'etapa--cancelada': e.cancelado }">
              <span class="etapa__ponto" />
              <span class="etapa__rotulo">{{ e.rotulo }}</span>
              <small>{{ e.data ? formatarData(e.data) : '—' }}</small>
            </li>
          </ol>
          <div class="reserva__acoes">
            <template v-if="r.status === 'Reservado'">
              <span class="texto-suave texto-pequeno"><Icone nome="info" :tamanho="14" /> Retire no balcão da biblioteca.</span>
              <button type="button" class="botao botao--perigo botao--pequeno" :disabled="ocupado === r._id" @click="cancelar(r)">Cancelar reserva</button>
            </template>
            <template v-else-if="r.status === 'Emprestado'">
              <span class="texto-suave texto-pequeno"><Icone nome="livro-aberto" :tamanho="14" /> Está com você. Devolva no balcão quando terminar.</span>
              <RouterLink :to="{ name: 'livro', params: { id: r.book._id }, hash: '#avaliacoes' }" class="botao botao--secundario botao--pequeno"><Icone nome="estrela" :tamanho="14" /> Avaliar</RouterLink>
            </template>
            <template v-else-if="r.status === 'Devolvido'">
              <span class="texto-suave texto-pequeno">Obrigado por devolver em dia.</span>
              <RouterLink :to="{ name: 'livro', params: { id: r.book._id }, hash: '#avaliacoes' }" class="botao botao--secundario botao--pequeno"><Icone nome="estrela" :tamanho="14" /> Avaliar</RouterLink>
            </template>
            <template v-else>
              <span class="texto-suave texto-pequeno">Reserva cancelada.</span>
              <RouterLink :to="{ name: 'livro', params: { id: r.book._id } }" class="botao botao--fantasma botao--pequeno">Ver livro</RouterLink>
            </template>
          </div>
        </div>
      </article>
    </div>
  </LayoutPainel>
</template>

<style scoped>
.abas {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--linha);
  margin-bottom: 22px;
}
.aba {
  padding: 10px 16px;
  font-weight: 600;
  color: var(--tinta-2);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.aba:hover {
  color: var(--tinta);
}
.aba--ativa {
  color: var(--verde);
  border-bottom-color: var(--verde);
}
.aba__contador {
  font-size: 0.75rem;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--papel-2);
  color: var(--tinta-2);
}
.aba--ativa .aba__contador {
  background: var(--verde-claro);
  color: var(--verde);
}
.lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.reserva {
  display: flex;
  gap: 20px;
  padding: 18px;
}
.reserva__capa {
  width: 84px;
  flex: none;
}
.reserva__corpo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.reserva__topo {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.reserva__titulo {
  font-family: var(--fonte-titulo);
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--tinta);
}
.etapas {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0;
}
.etapas li {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 16px;
  font-size: 0.85rem;
  color: var(--tinta-3);
}
.etapas li::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--linha);
}
.etapas li:first-child::before {
  left: 0;
}
.etapa__ponto {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--superficie);
  border: 2px solid var(--linha-2);
  z-index: 1;
}
.etapa--feita .etapa__ponto {
  background: var(--verde);
  border-color: var(--verde);
}
.etapa--feita::before {
  background: var(--verde);
}
.etapa--feita .etapa__rotulo {
  color: var(--tinta);
  font-weight: 600;
}
.etapa--cancelada .etapa__ponto,
.etapa--cancelada::before {
  background: var(--tinta-3);
  border-color: var(--tinta-3);
}
.reserva__acoes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.reserva__acoes > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}
@media (max-width: 560px) {
  .reserva {
    gap: 14px;
    padding: 14px;
  }
  .reserva__capa {
    width: 64px;
  }
  .reserva__topo {
    flex-direction: column;
  }
}
</style>
