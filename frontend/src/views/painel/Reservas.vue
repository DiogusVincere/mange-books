<script setup>
import { ref, computed, onMounted } from 'vue';
import api, { mensagemDeErro } from '@/api';
import { avisar } from '@/avisos';
import { confirmar } from '@/confirmar';
import { data as formatarData, dataRelativa, STATUS_RESERVA } from '@/formato';
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import Capa from '@/components/ui/Capa.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const reservas = ref([]);
const carregando = ref(true);
const erro = ref('');
const aba = ref('Reservado');
const termo = ref('');
const ocupado = ref('');

const ABAS = [
  { valor: 'Reservado', rotulo: 'Aguardando retirada' },
  { valor: 'Emprestado', rotulo: 'Emprestados' },
  { valor: 'Devolvido', rotulo: 'Devolvidos' },
  { valor: 'Cancelado', rotulo: 'Cancelados' },
  { valor: '', rotulo: 'Todos' },
];

onMounted(carregar);

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const { data } = await api.get('/api/reservations/todas');
    reservas.value = data;
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível carregar as reservas.');
  } finally {
    carregando.value = false;
  }
}

const contagem = computed(() => {
  const c = { '': reservas.value.length };
  for (const a of ABAS) if (a.valor) c[a.valor] = reservas.value.filter((r) => r.status === a.valor).length;
  return c;
});
const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const lista = computed(() => {
  const q = normalizar(termo.value.trim());
  return reservas.value.filter((r) => {
    if (aba.value && r.status !== aba.value) return false;
    if (!q) return true;
    const livro = r.book || {};
    const leitor = r.user || {};
    return [livro.title, livro.author, livro.isbn, leitor.fullName, leitor.email, leitor.cpf].some((v) => normalizar(v).includes(q));
  });
});

function diasCom(r) {
  if (!r.loanedAt) return '';
  const dias = Math.floor((Date.now() - new Date(r.loanedAt).getTime()) / 86400000);
  return dias <= 0 ? 'hoje' : `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

async function agir(r, rota, mensagem) {
  ocupado.value = r._id;
  try {
    const { data } = await api.post(`/api/reservations/${rota}`, { reservationId: r._id });
    avisar(data.message || mensagem);
    const i = reservas.value.findIndex((x) => x._id === r._id);
    if (i >= 0) reservas.value[i] = data.reservation;
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    ocupado.value = '';
  }
}
const retirar = (r) => agir(r, 'loan', 'Empréstimo registrado.');
const devolver = (r) => agir(r, 'return', 'Devolução registrada.');
async function cancelar(r) {
  const ok = await confirmar({
    titulo: 'Cancelar esta reserva?',
    texto: `"${r.book.title}" volta a ficar disponível. ${r.user.fullName} não será avisado automaticamente.`,
    confirmar: 'Cancelar reserva',
    cancelar: 'Manter',
    perigo: true,
  });
  if (ok) agir(r, 'cancel', 'Reserva cancelada.');
}
</script>

<template>
  <LayoutPainel titulo="Reservas e empréstimos" subtitulo="Registre retiradas e devoluções no balcão">
    <template #acoes>
      <button type="button" class="botao botao--secundario" :disabled="carregando" @click="carregar"><Icone nome="atualizar" :tamanho="16" /> Atualizar</button>
    </template>

    <div class="abas" role="tablist">
      <button
        v-for="a in ABAS"
        :key="a.valor"
        type="button"
        role="tab"
        class="aba"
        :class="{ 'aba--ativa': aba === a.valor }"
        :aria-selected="aba === a.valor"
        @click="aba = a.valor"
      >
        {{ a.rotulo }} <span class="aba__contador">{{ contagem[a.valor] || 0 }}</span>
      </button>
    </div>

    <div class="ferramentas cartao">
      <label class="ferramentas__busca">
        <Icone nome="busca" :tamanho="18" />
        <input v-model="termo" type="search" placeholder="Livro, leitor, e-mail ou CPF" aria-label="Filtrar reservas" />
      </label>
    </div>

    <div v-if="carregando" class="lista-esqueleto">
      <span v-for="i in 5" :key="i" class="esqueleto" style="height: 68px" />
    </div>
    <div v-else-if="erro" class="aviso-caixa aviso-caixa--erro"><Icone nome="alerta" :tamanho="18" /> <span>{{ erro }} <button type="button" class="link" @click="carregar">Tentar de novo</button></span></div>
    <Vazio
      v-else-if="!lista.length"
      icone="caixa"
      :titulo="aba === 'Reservado' ? 'Nenhuma reserva aguardando retirada' : 'Nada por aqui'"
      :texto="termo ? 'Nenhum registro bate com a busca.' : 'Quando um leitor reservar um livro pelo site, ele aparece aqui.'"
    />
    <div v-else class="cartao tabela-envolve">
      <table class="tabela">
        <thead>
          <tr>
            <th>Livro</th>
            <th>Leitor</th>
            <th>Reservado</th>
            <th>Retirado</th>
            <th>Devolvido</th>
            <th>Situação</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in lista" :key="r._id">
            <td>
              <div v-if="r.book" class="celula">
                <Capa :src="r.book.coverImage" :titulo="r.book.title" tamanho="S" class="celula__capa" />
                <div class="celula__texto">
                  <RouterLink :to="{ name: 'livro', params: { id: r.book._id } }"><strong>{{ r.book.title }}</strong></RouterLink>
                  <small class="texto-suave">{{ r.book.author }}</small>
                </div>
              </div>
              <span v-else class="texto-fraco">Livro removido</span>
            </td>
            <td>
              <div v-if="r.user" class="celula">
                <Avatar :nome="r.user.fullName" :tamanho="32" />
                <div class="celula__texto">
                  <RouterLink :to="{ name: 'painel-usuario', params: { id: r.user._id } }"><strong>{{ r.user.fullName }}</strong></RouterLink>
                  <small class="texto-suave">{{ r.user.email }}</small>
                </div>
              </div>
              <span v-else class="texto-fraco">Usuário removido</span>
            </td>
            <td :title="formatarData(r.reservedAt)">{{ dataRelativa(r.reservedAt) }}</td>
            <td>
              <template v-if="r.loanedAt">{{ formatarData(r.loanedAt) }}<small v-if="r.status === 'Emprestado'" class="texto-fraco"> · {{ diasCom(r) }}</small></template>
              <span v-else class="texto-fraco">—</span>
            </td>
            <td>{{ r.returnedAt ? formatarData(r.returnedAt) : r.canceledAt ? `cancelada ${formatarData(r.canceledAt)}` : '—' }}</td>
            <td><span class="selo selo--ponto" :class="STATUS_RESERVA[r.status].classe">{{ STATUS_RESERVA[r.status].rotulo }}</span></td>
            <td>
              <div class="tabela__acoes">
                <template v-if="r.status === 'Reservado'">
                  <button type="button" class="botao botao--primario botao--pequeno" :disabled="ocupado === r._id" @click="retirar(r)"><Icone nome="check" :tamanho="14" /> Registrar retirada</button>
                  <button type="button" class="botao botao--perigo botao--pequeno" :disabled="ocupado === r._id" title="Cancelar reserva" @click="cancelar(r)"><Icone nome="x" :tamanho="14" /></button>
                </template>
                <button v-else-if="r.status === 'Emprestado'" type="button" class="botao botao--secundario botao--pequeno" :disabled="ocupado === r._id" @click="devolver(r)">
                  <Icone nome="download" :tamanho="14" /> Registrar devolução
                </button>
                <span v-else class="texto-fraco texto-pequeno">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </LayoutPainel>
</template>

<style scoped>
.abas {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--linha);
  margin-bottom: 18px;
  overflow-x: auto;
}
.aba {
  padding: 10px 14px;
  font-weight: 600;
  color: var(--tinta-2);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
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
.ferramentas {
  display: flex;
  padding: 10px 12px;
  margin-bottom: 18px;
}
.ferramentas__busca {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--tinta-3);
  padding: 0 8px;
}
.ferramentas__busca input {
  flex: 1;
  border: 0;
  outline: 0;
  padding: 9px 0;
  background: transparent;
  color: var(--tinta);
  min-width: 0;
}
.lista-esqueleto {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.celula {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}
.celula__capa {
  width: 34px;
  flex: none;
}
.celula__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.celula__texto a {
  color: inherit;
}
.link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}
</style>
