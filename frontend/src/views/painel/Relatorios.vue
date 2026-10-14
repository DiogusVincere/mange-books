<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Chart } from 'chart.js/auto';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import api, { mensagemDeErro } from '@/api';
import { avisar } from '@/avisos';
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import Icone from '@/components/ui/Icone.vue';

const resumo = ref(null);
const livros = ref([]);
const leitores = ref([]);
const notas = ref([]);
const carregando = ref(true);
const erro = ref('');

const canvasLivros = ref(null);
const canvasLeitores = ref(null);
const canvasNotas = ref(null);
const canvasGeneros = ref(null);
const graficos = [];

const CORES = ['#1e4d4a', '#2a6b66', '#3d8a83', '#d9962b', '#2f5b8a', '#b3432d', '#7b8694', '#a86f12', '#5b3f8a', '#3f6b2a'];

onMounted(carregar);
onBeforeUnmount(destruir);

function destruir() {
  while (graficos.length) graficos.pop().destroy();
}

async function carregar() {
  carregando.value = true;
  erro.value = '';
  destruir();
  try {
    const [r, l, u, n] = await Promise.all([
      api.get('/api/reports/resumo'),
      api.get('/api/reports/books'),
      api.get('/api/reports/users'),
      api.get('/api/reports/ratings'),
    ]);
    resumo.value = r.data;
    livros.value = l.data;
    leitores.value = u.data;
    notas.value = n.data;
    carregando.value = false;
    await nextTick();
    desenhar();
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível carregar os relatórios.');
    carregando.value = false;
  }
}

const opcoesBase = (horizontal, maximo) => ({
  indexAxis: horizontal ? 'y' : 'x',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, max: horizontal ? maximo : undefined, ticks: { precision: 0 }, grid: { color: 'rgba(27,36,48,.06)' } },
    y: { beginAtZero: true, max: horizontal ? undefined : maximo, ticks: { precision: 0 }, grid: { color: 'rgba(27,36,48,.06)' } },
  },
});

function desenhar() {
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.color = '#4a5563';
  if (canvasLivros.value) {
    graficos.push(new Chart(canvasLivros.value, {
      type: 'bar',
      data: { labels: livros.value.map((x) => x.name), datasets: [{ label: 'Reservas', data: livros.value.map((x) => x.count), backgroundColor: '#1e4d4a', borderRadius: 6 }] },
      options: opcoesBase(true),
    }));
  }
  if (canvasLeitores.value) {
    graficos.push(new Chart(canvasLeitores.value, {
      type: 'bar',
      data: { labels: leitores.value.map((x) => x.name), datasets: [{ label: 'Reservas', data: leitores.value.map((x) => x.count), backgroundColor: '#d9962b', borderRadius: 6 }] },
      options: opcoesBase(false),
    }));
  }
  if (canvasNotas.value) {
    graficos.push(new Chart(canvasNotas.value, {
      type: 'bar',
      data: { labels: notas.value.map((x) => x.name), datasets: [{ label: 'Nota média', data: notas.value.map((x) => x.count), backgroundColor: '#2f5b8a', borderRadius: 6 }] },
      options: {
        ...opcoesBase(true, 5),
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.raw} de 5 · ${notas.value[c.dataIndex].total} ${notas.value[c.dataIndex].total === 1 ? 'avaliação' : 'avaliações'}` } } },
      },
    }));
  }
  if (canvasGeneros.value && resumo.value) {
    graficos.push(new Chart(canvasGeneros.value, {
      type: 'doughnut',
      data: { labels: resumo.value.porGenero.map((x) => x.name), datasets: [{ data: resumo.value.porGenero.map((x) => x.count), backgroundColor: CORES, borderWidth: 2, borderColor: '#fff' }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom' } } },
    }));
  }
}

const hoje = () => new Date().toLocaleDateString('pt-BR');

function exportarPdf() {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const largura = doc.internal.pageSize.getWidth();
    const r = resumo.value;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Mange Books: relatórios', 14, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Gerado em ${hoje()}`, 14, 25);
    doc.setFontSize(11);
    const linhas = [
      `Livros no acervo: ${r.livros}`,
      `Usuários: ${r.usuarios}`,
      `Reservas aguardando retirada: ${r.reservasAtivas}`,
      `Empréstimos em andamento: ${r.emprestimosAtivos}`,
      `Devoluções registradas: ${r.devolucoes}`,
      `Avaliações: ${r.avaliacoes}${r.notaMediaGeral ? ` (média ${r.notaMediaGeral})` : ''}`,
    ];
    linhas.forEach((t, i) => doc.text(t, 14, 36 + i * 7));
    const blocos = [
      ['Livros mais reservados', canvasLivros.value],
      ['Leitores mais ativos', canvasLeitores.value],
      ['Livros mais bem avaliados', canvasNotas.value],
      ['Acervo por gênero', canvasGeneros.value],
    ];
    let y = 86;
    blocos.forEach(([titulo, canvas], i) => {
      if (!canvas) return;
      if (i > 0) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(titulo, 14, y);
      const imagem = canvas.toDataURL('image/png', 1.0);
      const alturaImg = ((largura - 28) * canvas.height) / canvas.width;
      doc.addImage(imagem, 'PNG', 14, y + 6, largura - 28, alturaImg);
    });
    doc.save(`mange-books-relatorios-${new Date().toISOString().slice(0, 10)}.pdf`);
    avisar('PDF gerado.');
  } catch (e) {
    avisar('Não foi possível gerar o PDF.', 'erro');
  }
}

function exportarExcel() {
  try {
    const wb = XLSX.utils.book_new();
    const r = resumo.value;
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['Indicador', 'Valor'],
      ['Livros no acervo', r.livros],
      ['Usuários', r.usuarios],
      ['Reservas aguardando retirada', r.reservasAtivas],
      ['Empréstimos em andamento', r.emprestimosAtivos],
      ['Devoluções registradas', r.devolucoes],
      ['Avaliações', r.avaliacoes],
      ['Nota média geral', r.notaMediaGeral || ''],
      ['Gerado em', hoje()],
    ]), 'Resumo');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Livro', 'Autor', 'Reservas'], ...livros.value.map((x) => [x.name, x.author, x.count])]), 'Mais reservados');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Leitor', 'Reservas'], ...leitores.value.map((x) => [x.name, x.count])]), 'Leitores ativos');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Livro', 'Autor', 'Nota média', 'Avaliações'], ...notas.value.map((x) => [x.name, x.author, x.count, x.total])]), 'Mais bem avaliados');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Gênero', 'Livros'], ...r.porGenero.map((x) => [x.name, x.count])]), 'Por gênero');
    XLSX.writeFile(wb, `mange-books-relatorios-${new Date().toISOString().slice(0, 10)}.xlsx`);
    avisar('Planilha gerada.');
  } catch (e) {
    avisar('Não foi possível gerar a planilha.', 'erro');
  }
}
</script>

<template>
  <LayoutPainel titulo="Relatórios" subtitulo="Números calculados na hora a partir das reservas, avaliações e do acervo">
    <template #acoes>
      <button type="button" class="botao botao--secundario" :disabled="carregando || !!erro" @click="exportarExcel"><Icone nome="download" :tamanho="16" /> Excel</button>
      <button type="button" class="botao botao--primario" :disabled="carregando || !!erro" @click="exportarPdf"><Icone nome="download" :tamanho="16" /> PDF</button>
    </template>

    <div v-if="carregando" class="indicadores">
      <span v-for="i in 6" :key="i" class="esqueleto" style="height: 96px" />
    </div>
    <div v-else-if="erro" class="aviso-caixa aviso-caixa--erro"><Icone nome="alerta" :tamanho="18" /> <span>{{ erro }} <button type="button" class="link" @click="carregar">Tentar de novo</button></span></div>

    <template v-else-if="resumo">
      <div class="indicadores">
        <div class="indicador cartao"><Icone nome="livro-aberto" :tamanho="22" /><strong>{{ resumo.livros }}</strong><span>livros no acervo</span></div>
        <div class="indicador cartao"><Icone nome="usuarios" :tamanho="22" /><strong>{{ resumo.usuarios }}</strong><span>usuários</span></div>
        <div class="indicador cartao indicador--ambar"><Icone nome="marcador" :tamanho="22" /><strong>{{ resumo.reservasAtivas }}</strong><span>aguardando retirada</span></div>
        <div class="indicador cartao indicador--azul"><Icone nome="caixa" :tamanho="22" /><strong>{{ resumo.emprestimosAtivos }}</strong><span>emprestados agora</span></div>
        <div class="indicador cartao"><Icone nome="check" :tamanho="22" /><strong>{{ resumo.devolucoes }}</strong><span>devoluções</span></div>
        <div class="indicador cartao indicador--ambar"><Icone nome="estrela" :tamanho="22" /><strong>{{ resumo.notaMediaGeral ? resumo.notaMediaGeral.toFixed(1) : '—' }}</strong><span>nota média · {{ resumo.avaliacoes }} avaliações</span></div>
      </div>

      <div class="graficos">
        <section class="cartao cartao--recheio grafico">
          <h3>Livros mais reservados</h3>
          <p class="texto-suave">Reservas, empréstimos e devoluções contam; canceladas não.</p>
          <div class="grafico__area"><canvas ref="canvasLivros" /></div>
        </section>
        <section class="cartao cartao--recheio grafico">
          <h3>Leitores mais ativos</h3>
          <p class="texto-suave">Quem mais reservou livros até hoje.</p>
          <div class="grafico__area"><canvas ref="canvasLeitores" /></div>
        </section>
        <section class="cartao cartao--recheio grafico">
          <h3>Livros mais bem avaliados</h3>
          <p class="texto-suave">Nota média de 1 a 5; passe o mouse para ver quantas avaliações.</p>
          <div class="grafico__area"><canvas ref="canvasNotas" /></div>
        </section>
        <section class="cartao cartao--recheio grafico">
          <h3>Acervo por gênero</h3>
          <p class="texto-suave">Quantos títulos existem em cada gênero.</p>
          <div class="grafico__area"><canvas ref="canvasGeneros" /></div>
        </section>
      </div>
    </template>
  </LayoutPainel>
</template>

<style scoped>
.indicadores {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}
.indicador {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.indicador svg {
  color: var(--verde);
  margin-bottom: 6px;
}
.indicador--ambar svg {
  color: var(--ambar-escuro);
}
.indicador--azul svg {
  color: var(--azul);
}
.indicador strong {
  font-family: var(--fonte-titulo);
  font-size: 2rem;
  line-height: 1;
}
.indicador span {
  color: var(--tinta-2);
  font-size: 0.85rem;
}
.graficos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
.grafico h3 {
  font-size: 1.15rem;
  margin-bottom: 2px;
}
.grafico p {
  font-size: 0.9rem;
  margin-bottom: 14px;
}
.grafico__area {
  position: relative;
  height: 320px;
}
.link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}
@media (max-width: 1200px) {
  .indicadores {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
  .graficos {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .indicadores {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
