<script setup>
import { ref, computed, onMounted } from 'vue';
import api, { mensagemDeErro } from '@/api';
import { avisar } from '@/avisos';
import { confirmar } from '@/confirmar';
import { GENEROS, SITUACOES } from '@/formato';
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import Capa from '@/components/ui/Capa.vue';
import Estrelas from '@/components/ui/Estrelas.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const livros = ref([]);
const carregando = ref(true);
const erro = ref('');
const termo = ref('');
const genero = ref('');
const situacao = ref('');
const excluindo = ref('');

onMounted(carregar);

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const { data } = await api.get('/books', { params: { ordem: 'titulo' } });
    livros.value = data;
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível carregar o acervo.');
  } finally {
    carregando.value = false;
  }
}

const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const filtrados = computed(() => {
  const q = normalizar(termo.value.trim());
  return livros.value.filter((l) => {
    if (genero.value && l.genre !== genero.value) return false;
    if (situacao.value && l.situacao !== situacao.value) return false;
    if (q && !normalizar(l.title).includes(q) && !normalizar(l.author).includes(q) && !String(l.isbn).includes(q)) return false;
    return true;
  });
});
const resumo = computed(() => ({
  total: livros.value.length,
  disponiveis: livros.value.filter((l) => l.situacao === 'disponivel').length,
  fora: livros.value.filter((l) => l.situacao !== 'disponivel').length,
}));

async function excluir(l) {
  const ok = await confirmar({
    titulo: `Excluir "${l.title}"?`,
    texto: 'O livro sai do acervo junto com as avaliações e o histórico de reservas. Não dá para desfazer.',
    confirmar: 'Excluir livro',
    perigo: true,
  });
  if (!ok) return;
  excluindo.value = l._id;
  try {
    await api.delete(`/books/${l._id}`);
    avisar(`"${l.title}" excluído.`, 'info');
    livros.value = livros.value.filter((x) => x._id !== l._id);
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    excluindo.value = '';
  }
}
</script>

<template>
  <LayoutPainel titulo="Acervo" :subtitulo="carregando ? '' : `${resumo.total} títulos · ${resumo.disponiveis} disponíveis · ${resumo.fora} reservados ou emprestados`">
    <template #acoes>
      <RouterLink :to="{ name: 'painel-livro-novo' }" class="botao botao--primario"><Icone nome="mais" :tamanho="16" /> Novo livro</RouterLink>
    </template>

    <div class="ferramentas cartao">
      <label class="ferramentas__busca">
        <Icone nome="busca" :tamanho="18" />
        <input v-model="termo" type="search" placeholder="Título, autor ou ISBN" aria-label="Filtrar livros" />
      </label>
      <select v-model="genero" aria-label="Gênero">
        <option value="">Todos os gêneros</option>
        <option v-for="g in GENEROS" :key="g" :value="g">{{ g }}</option>
      </select>
      <select v-model="situacao" aria-label="Situação">
        <option value="">Qualquer situação</option>
        <option value="disponivel">Disponíveis</option>
        <option value="reservado">Reservados</option>
        <option value="emprestado">Emprestados</option>
      </select>
    </div>

    <div v-if="carregando" class="lista-esqueleto">
      <span v-for="i in 6" :key="i" class="esqueleto" style="height: 64px" />
    </div>
    <div v-else-if="erro" class="aviso-caixa aviso-caixa--erro"><Icone nome="alerta" :tamanho="18" /> <span>{{ erro }} <button type="button" class="link" @click="carregar">Tentar de novo</button></span></div>
    <Vazio v-else-if="!filtrados.length" icone="busca" titulo="Nenhum livro com esses filtros" texto="Ajuste a busca ou cadastre um novo título.">
      <RouterLink :to="{ name: 'painel-livro-novo' }" class="botao botao--primario">Novo livro</RouterLink>
    </Vazio>
    <div v-else class="cartao tabela-envolve">
      <table class="tabela">
        <thead>
          <tr>
            <th>Livro</th>
            <th>Gênero</th>
            <th>Ano</th>
            <th>ISBN</th>
            <th>Avaliação</th>
            <th>Situação</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in filtrados" :key="l._id">
            <td>
              <div class="livro-celula">
                <Capa :src="l.coverImage" :titulo="l.title" tamanho="S" class="livro-celula__capa" />
                <div class="livro-celula__texto">
                  <RouterLink :to="{ name: 'livro', params: { id: l._id } }"><strong>{{ l.title }}</strong></RouterLink>
                  <small class="texto-suave">{{ l.author }}</small>
                </div>
              </div>
            </td>
            <td>{{ l.genre }}</td>
            <td>{{ l.year }}</td>
            <td class="mono">{{ l.isbn }}</td>
            <td>
              <span v-if="l.notaMedia" class="nota"><Estrelas :valor="l.notaMedia" :tamanho="13" /> {{ l.notaMedia.toFixed(1) }} <small class="texto-fraco">({{ l.totalAvaliacoes }})</small></span>
              <span v-else class="texto-fraco">—</span>
            </td>
            <td><span class="selo selo--ponto" :class="SITUACOES[l.situacao].classe">{{ SITUACOES[l.situacao].rotulo }}</span></td>
            <td>
              <div class="tabela__acoes">
                <RouterLink :to="{ name: 'painel-livro-editar', params: { id: l._id } }" class="botao botao--secundario botao--pequeno"><Icone nome="editar" :tamanho="14" /> Editar</RouterLink>
                <button type="button" class="botao botao--perigo botao--pequeno" :disabled="excluindo === l._id" title="Excluir" @click="excluir(l)"><Icone nome="lixeira" :tamanho="14" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </LayoutPainel>
</template>

<style scoped>
.ferramentas {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
  align-items: center;
}
.ferramentas__busca {
  flex: 1;
  min-width: 220px;
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
.ferramentas select {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--linha-2);
  background: var(--superficie);
  font-weight: 500;
}
.lista-esqueleto {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.livro-celula {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}
.livro-celula__capa {
  width: 38px;
  flex: none;
}
.livro-celula__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.livro-celula__texto a {
  color: inherit;
}
.mono {
  font-variant-numeric: tabular-nums;
  color: var(--tinta-2);
  font-size: 0.86rem;
}
.nota {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.88rem;
}
.link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}
</style>
