<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import api, { mensagemDeErro, errosDeCampo, urlImagem } from '@/api';
import { avisar } from '@/avisos';
import { confirmar } from '@/confirmar';
import { GENEROS } from '@/formato';
import Capa from '@/components/ui/Capa.vue';
import Icone from '@/components/ui/Icone.vue';

// Cadastro e edição de livro. Sem `id`, cria; com `id`, carrega e atualiza.
const props = defineProps({ id: { type: String, default: '' } });
const router = useRouter();

const form = reactive({
  title: '',
  author: '',
  description: '',
  year: '',
  genre: '',
  pageCount: '',
  coverType: '',
  isbn: '',
  coverUrl: '',
});
const erros = reactive({});
const erroGeral = ref('');
const carregando = ref(Boolean(props.id));
const salvando = ref(false);
const excluindo = ref(false);
const capaAtual = ref('');
const arquivo = ref(null);
const previa = ref('');
const removerCapa = ref(false);
const arrastando = ref(false);
const buscandoCapa = ref(false);
const entradaArquivo = ref(null);

const anoAtual = new Date().getFullYear();
const editando = computed(() => Boolean(props.id));
const capaMostrada = computed(() => {
  if (previa.value) return previa.value;
  if (form.coverUrl.trim()) return form.coverUrl.trim();
  if (removerCapa.value) return '';
  return capaAtual.value;
});

onMounted(async () => {
  if (!props.id) return;
  try {
    const { data } = await api.get(`/books/${props.id}`);
    Object.assign(form, {
      title: data.title,
      author: data.author,
      description: data.description,
      year: data.year,
      genre: data.genre,
      pageCount: data.pageCount,
      coverType: data.coverType,
      isbn: data.isbn,
      coverUrl: '',
    });
    capaAtual.value = data.coverImage || '';
  } catch (e) {
    erroGeral.value = mensagemDeErro(e, 'Não foi possível carregar o livro.');
  } finally {
    carregando.value = false;
  }
});
onBeforeUnmount(() => {
  if (previa.value) URL.revokeObjectURL(previa.value);
});

function escolherArquivo(lista) {
  const f = lista && lista[0];
  if (!f) return;
  if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) {
    avisar('Envie uma imagem JPG, PNG, WebP ou GIF.', 'erro');
    return;
  }
  if (f.size > 2 * 1024 * 1024) {
    avisar('A imagem deve ter no máximo 2 MB.', 'erro');
    return;
  }
  if (previa.value) URL.revokeObjectURL(previa.value);
  arquivo.value = f;
  previa.value = URL.createObjectURL(f);
  form.coverUrl = '';
  removerCapa.value = false;
}
function soltar(e) {
  arrastando.value = false;
  escolherArquivo(e.dataTransfer.files);
}
function limparArquivo() {
  if (previa.value) URL.revokeObjectURL(previa.value);
  arquivo.value = null;
  previa.value = '';
  if (entradaArquivo.value) entradaArquivo.value.value = '';
}
function tirarCapa() {
  limparArquivo();
  form.coverUrl = '';
  removerCapa.value = true;
}

// Procura a capa na Open Library pelo ISBN digitado
function buscarCapaPeloIsbn() {
  const isbn = form.isbn.replace(/[-\s]/g, '');
  if (!/^\d{10}$|^\d{13}$/.test(isbn)) {
    erros.isbn = 'Digite um ISBN válido para buscar a capa';
    return;
  }
  delete erros.isbn;
  buscandoCapa.value = true;
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  const img = new Image();
  img.onload = () => {
    buscandoCapa.value = false;
    if (img.naturalWidth < 10) {
      avisar('A Open Library não tem capa para esse ISBN.', 'aviso');
      return;
    }
    limparArquivo();
    removerCapa.value = false;
    form.coverUrl = url;
    avisar('Capa encontrada na Open Library.');
  };
  img.onerror = () => {
    buscandoCapa.value = false;
    avisar('A Open Library não tem capa para esse ISBN.', 'aviso');
  };
  img.src = `${url}?default=false`;
}

function validar() {
  for (const k of Object.keys(erros)) delete erros[k];
  if (!form.title.trim()) erros.title = 'Informe o título';
  if (!form.author.trim()) erros.author = 'Informe o autor';
  if (!form.description.trim()) erros.description = 'Escreva uma descrição';
  const ano = Number(form.year);
  if (!Number.isInteger(ano) || ano < 1400 || ano > anoAtual + 1) erros.year = `Entre 1400 e ${anoAtual + 1}`;
  if (!GENEROS.includes(form.genre)) erros.genre = 'Selecione o gênero';
  const paginas = Number(form.pageCount);
  if (!Number.isInteger(paginas) || paginas < 1) erros.pageCount = 'Informe o número de páginas';
  if (!['Dura', 'Mole'].includes(form.coverType)) erros.coverType = 'Selecione o tipo de capa';
  if (!/^\d{10}$|^\d{13}$/.test(form.isbn.replace(/[-\s]/g, ''))) erros.isbn = 'ISBN com 10 ou 13 dígitos';
  if (form.coverUrl.trim() && !/^https?:\/\//i.test(form.coverUrl.trim())) erros.coverUrl = 'URL inválida';
  return Object.keys(erros).length === 0;
}

async function salvar() {
  erroGeral.value = '';
  if (!validar()) {
    erroGeral.value = 'Confira os campos destacados.';
    return;
  }
  salvando.value = true;
  try {
    const campos = {
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      year: Number(form.year),
      genre: form.genre,
      pageCount: Number(form.pageCount),
      coverType: form.coverType,
      isbn: form.isbn.replace(/[-\s]/g, ''),
    };
    let corpo;
    if (arquivo.value) {
      corpo = new FormData();
      Object.entries(campos).forEach(([k, v]) => corpo.append(k, v));
      corpo.append('coverImage', arquivo.value);
    } else {
      corpo = { ...campos };
      if (form.coverUrl.trim()) corpo.coverUrl = form.coverUrl.trim();
      if (removerCapa.value) corpo.removerCapa = 'true';
    }
    const { data } = editando.value ? await api.put(`/books/${props.id}`, corpo) : await api.post('/books', corpo);
    avisar(editando.value ? `"${data.title}" atualizado.` : `"${data.title}" cadastrado no acervo.`);
    router.push({ name: 'painel-livros' });
  } catch (e) {
    Object.assign(erros, errosDeCampo(e));
    erroGeral.value = mensagemDeErro(e, 'Não foi possível salvar o livro.');
  } finally {
    salvando.value = false;
  }
}

async function excluir() {
  const ok = await confirmar({
    titulo: `Excluir "${form.title}"?`,
    texto: 'O livro sai do acervo junto com as avaliações e o histórico de reservas. Não dá para desfazer.',
    confirmar: 'Excluir livro',
    perigo: true,
  });
  if (!ok) return;
  excluindo.value = true;
  try {
    await api.delete(`/books/${props.id}`);
    avisar('Livro excluído.', 'info');
    router.push({ name: 'painel-livros' });
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    excluindo.value = false;
  }
}
</script>

<template>
  <div v-if="carregando" class="form-livro">
    <span class="esqueleto" style="height: 420px" />
    <span class="esqueleto" style="height: 420px" />
  </div>
  <form v-else class="form-livro" novalidate @submit.prevent="salvar">
    <div class="form-livro__campos">
      <div v-if="erroGeral" class="aviso-caixa aviso-caixa--erro" role="alert"><Icone nome="alerta" :tamanho="18" /> <span>{{ erroGeral }}</span></div>

      <section class="cartao cartao--recheio">
        <h3>Identificação</h3>
        <div class="campo" :class="{ 'campo--erro': erros.title }">
          <label for="l-title">Título</label>
          <input id="l-title" v-model="form.title" type="text" maxlength="200" />
          <span v-if="erros.title" class="campo__erro">{{ erros.title }}</span>
        </div>
        <div class="campos-2">
          <div class="campo" :class="{ 'campo--erro': erros.author }">
            <label for="l-author">Autor</label>
            <input id="l-author" v-model="form.author" type="text" maxlength="150" />
            <span v-if="erros.author" class="campo__erro">{{ erros.author }}</span>
          </div>
          <div class="campo campo--com-botao" :class="{ 'campo--erro': erros.isbn }">
            <label for="l-isbn">ISBN</label>
            <input id="l-isbn" v-model="form.isbn" type="text" inputmode="numeric" placeholder="13 dígitos" />
            <button type="button" class="campo__botao" title="Buscar capa pelo ISBN na Open Library" :disabled="buscandoCapa" @click="buscarCapaPeloIsbn">
              <Icone :nome="buscandoCapa ? 'relogio' : 'busca'" :tamanho="18" />
            </button>
            <span v-if="erros.isbn" class="campo__erro">{{ erros.isbn }}</span>
            <span v-else class="campo__dica">A lupa procura a capa na Open Library pelo ISBN.</span>
          </div>
        </div>
        <div class="campos-3">
          <div class="campo" :class="{ 'campo--erro': erros.genre }">
            <label for="l-genre">Gênero</label>
            <select id="l-genre" v-model="form.genre">
              <option value="" disabled>Selecione</option>
              <option v-for="g in GENEROS" :key="g">{{ g }}</option>
            </select>
            <span v-if="erros.genre" class="campo__erro">{{ erros.genre }}</span>
          </div>
          <div class="campo" :class="{ 'campo--erro': erros.year }">
            <label for="l-year">Ano</label>
            <input id="l-year" v-model="form.year" type="number" min="1400" :max="anoAtual + 1" />
            <span v-if="erros.year" class="campo__erro">{{ erros.year }}</span>
          </div>
          <div class="campo" :class="{ 'campo--erro': erros.pageCount }">
            <label for="l-pages">Páginas</label>
            <input id="l-pages" v-model="form.pageCount" type="number" min="1" />
            <span v-if="erros.pageCount" class="campo__erro">{{ erros.pageCount }}</span>
          </div>
        </div>
        <div class="campo" :class="{ 'campo--erro': erros.coverType }">
          <span class="campo__rotulo">Tipo de capa</span>
          <div class="opcoes">
            <label class="opcao" :class="{ 'opcao--ativa': form.coverType === 'Dura' }"><input v-model="form.coverType" type="radio" value="Dura" /> Capa dura</label>
            <label class="opcao" :class="{ 'opcao--ativa': form.coverType === 'Mole' }"><input v-model="form.coverType" type="radio" value="Mole" /> Capa mole</label>
          </div>
          <span v-if="erros.coverType" class="campo__erro">{{ erros.coverType }}</span>
        </div>
      </section>

      <section class="cartao cartao--recheio">
        <h3>Descrição</h3>
        <div class="campo" :class="{ 'campo--erro': erros.description }">
          <label for="l-description" class="sr-only">Descrição</label>
          <textarea id="l-description" v-model="form.description" rows="6" maxlength="3000" placeholder="Do que o livro trata? Duas ou três frases bastam."></textarea>
          <span v-if="erros.description" class="campo__erro">{{ erros.description }}</span>
          <span v-else class="campo__dica">{{ form.description.length }}/3000</span>
        </div>
      </section>
    </div>

    <aside class="form-livro__capa">
      <section class="cartao cartao--recheio">
        <h3>Capa</h3>
        <div class="capa-previa">
          <Capa :src="capaMostrada" :titulo="form.title || 'Sem capa'" :autor="form.author" tamanho="L" />
        </div>
        <div
          class="solta"
          :class="{ 'solta--ativa': arrastando }"
          @dragover.prevent="arrastando = true"
          @dragleave="arrastando = false"
          @drop.prevent="soltar"
        >
          <Icone nome="upload" :tamanho="22" />
          <p>Arraste uma imagem aqui ou <button type="button" class="link" @click="entradaArquivo && entradaArquivo.click()">escolha um arquivo</button></p>
          <small>JPG, PNG ou WebP até 2 MB</small>
          <input ref="entradaArquivo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="sr-only" @change="escolherArquivo($event.target.files)" />
        </div>
        <p v-if="arquivo" class="arquivo-escolhido">
          <Icone nome="check" :tamanho="16" /> {{ arquivo.name }}
          <button type="button" class="link" @click="limparArquivo">remover</button>
        </p>
        <div class="campo" :class="{ 'campo--erro': erros.coverUrl }">
          <label for="l-coverUrl">ou URL de uma imagem</label>
          <input id="l-coverUrl" v-model="form.coverUrl" type="url" placeholder="https://…" :disabled="Boolean(arquivo)" @input="removerCapa = false" />
          <span v-if="erros.coverUrl" class="campo__erro">{{ erros.coverUrl }}</span>
        </div>
        <button v-if="capaAtual && !removerCapa && !arquivo && !form.coverUrl" type="button" class="botao botao--fantasma botao--pequeno" @click="tirarCapa">
          <Icone nome="x" :tamanho="14" /> Remover capa atual
        </button>
        <p v-if="removerCapa" class="texto-fraco texto-pequeno">A capa será removida ao salvar.</p>
      </section>

      <div class="form-livro__acoes">
        <button type="submit" class="botao botao--primario botao--grande botao--bloco" :disabled="salvando">
          {{ salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar livro' }}
        </button>
        <RouterLink :to="{ name: 'painel-livros' }" class="botao botao--fantasma botao--bloco">Cancelar</RouterLink>
        <button v-if="editando" type="button" class="botao botao--perigo botao--bloco" :disabled="excluindo" @click="excluir">
          <Icone nome="lixeira" :tamanho="16" /> Excluir livro
        </button>
      </div>
    </aside>
  </form>
</template>

<style scoped>
.form-livro {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 22px;
  align-items: start;
}
.form-livro__campos,
.form-livro__capa {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.form-livro__capa {
  position: sticky;
  top: 24px;
}
.cartao h3 {
  font-size: 1.15rem;
  margin-bottom: 16px;
}
.opcoes {
  display: flex;
  gap: 10px;
}
.opcao {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid var(--linha-2);
  border-radius: var(--raio-p);
  cursor: pointer;
  font-weight: 500;
  background: var(--superficie);
}
.opcao--ativa {
  border-color: var(--verde);
  background: var(--verde-claro);
  color: var(--verde);
}
.opcao input {
  accent-color: var(--verde);
}
.capa-previa {
  max-width: 200px;
  margin: 0 auto 16px;
  border-radius: 10px;
  box-shadow: var(--sombra-1);
}
.solta {
  border: 2px dashed var(--linha-2);
  border-radius: var(--raio-p);
  padding: 18px;
  text-align: center;
  color: var(--tinta-2);
  transition: border-color 0.15s, background 0.15s;
}
.solta svg {
  margin: 0 auto 6px;
  color: var(--verde);
}
.solta p {
  margin: 0;
  font-size: 0.92rem;
}
.solta small {
  color: var(--tinta-3);
}
.solta--ativa {
  border-color: var(--verde);
  background: var(--verde-claro);
}
.link {
  color: var(--verde);
  font-weight: 600;
  text-decoration: underline;
}
.arquivo-escolhido {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  margin: 10px 0 0;
  color: var(--verde);
}
.arquivo-escolhido .link {
  margin-left: auto;
}
.form-livro__capa .campo {
  margin-top: 14px;
  margin-bottom: 8px;
}
.form-livro__acoes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (max-width: 980px) {
  .form-livro {
    grid-template-columns: 1fr;
  }
  .form-livro__capa {
    position: static;
  }
}
</style>
