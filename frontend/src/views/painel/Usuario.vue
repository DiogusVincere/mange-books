<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api, { mensagemDeErro } from '@/api';
import { sessao } from '@/sessao';
import { avisar } from '@/avisos';
import { confirmar } from '@/confirmar';
import { data as formatarData, dataRelativa, mascaraCpf, mascaraCep, papel, STATUS_RESERVA } from '@/formato';
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import EditarUsuario from '@/components/usuarios/EditarUsuario.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Capa from '@/components/ui/Capa.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();

const usuario = ref(null);
const reservas = ref([]);
const carregando = ref(true);
const erro = ref('');
const editando = ref(false);
const mudandoPapel = ref(false);
const excluindo = ref(false);

const souEu = computed(() => sessao.estado.usuario && String(sessao.estado.usuario._id) === String(props.id));

onMounted(carregar);

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const [u, r] = await Promise.all([api.get(`/api/auth/${props.id}`), api.get('/api/reservations/todas')]);
    usuario.value = u.data;
    reservas.value = r.data.filter((x) => x.user && String(x.user._id) === String(props.id));
  } catch (e) {
    erro.value = e.response && e.response.status === 404 ? 'Usuário não encontrado.' : mensagemDeErro(e);
  } finally {
    carregando.value = false;
  }
}

const emAberto = computed(() => reservas.value.filter((r) => ['Reservado', 'Emprestado'].includes(r.status)));
const endereco = computed(() => {
  const a = (usuario.value && usuario.value.address) || {};
  return [a.logradouro, a.numero, a.bairro, a.cidade && a.estado ? `${a.cidade} - ${a.estado}` : a.cidade, a.cep ? `CEP ${mascaraCep(a.cep)}` : ''].filter(Boolean).join(', ');
});

async function mudarPapel() {
  const novo = usuario.value.role === 'bibliotecario' ? 'leitor' : 'bibliotecario';
  const ok = await confirmar({
    titulo: novo === 'bibliotecario' ? `Tornar ${usuario.value.fullName} bibliotecário(a)?` : `Rebaixar ${usuario.value.fullName} para leitor(a)?`,
    texto: novo === 'bibliotecario'
      ? 'A pessoa passa a cadastrar livros, registrar empréstimos, ver usuários e relatórios.'
      : 'A pessoa deixa de acessar o painel da biblioteca e volta a só reservar e avaliar.',
    confirmar: novo === 'bibliotecario' ? 'Promover' : 'Rebaixar',
  });
  if (!ok) return;
  mudandoPapel.value = true;
  try {
    const { data } = await api.put(`/api/auth/${props.id}`, { role: novo });
    usuario.value = data;
    avisar(`Agora ${data.fullName} é ${papel(data.role).toLowerCase()}.`);
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    mudandoPapel.value = false;
  }
}

async function excluir() {
  const ok = await confirmar({
    titulo: `Excluir ${usuario.value.fullName}?`,
    texto: 'As avaliações e o histórico de reservas dessa pessoa também são apagados. Não dá para desfazer.',
    confirmar: 'Excluir usuário',
    perigo: true,
  });
  if (!ok) return;
  excluindo.value = true;
  try {
    await api.delete(`/api/auth/${props.id}`);
    avisar('Usuário excluído.', 'info');
    router.push({ name: 'painel-usuarios' });
  } catch (e) {
    avisar(mensagemDeErro(e), 'erro');
  } finally {
    excluindo.value = false;
  }
}
</script>

<template>
  <LayoutPainel :titulo="usuario ? usuario.fullName : 'Usuário'" :subtitulo="usuario ? `@${usuario.username} · ${papel(usuario.role)}` : ''">
    <template #acoes>
      <RouterLink :to="{ name: 'painel-usuarios' }" class="botao botao--fantasma"><Icone nome="seta-esq" :tamanho="16" /> Todos os usuários</RouterLink>
      <button v-if="usuario" type="button" class="botao botao--secundario" @click="editando = true"><Icone nome="editar" :tamanho="16" /> Editar dados</button>
    </template>

    <div v-if="carregando" class="lista-esqueleto">
      <span class="esqueleto" style="height: 160px" />
      <span class="esqueleto" style="height: 220px" />
    </div>
    <Vazio v-else-if="erro" icone="alerta" titulo="Ops" :texto="erro">
      <RouterLink :to="{ name: 'painel-usuarios' }" class="botao botao--primario">Voltar</RouterLink>
    </Vazio>
    <div v-else-if="usuario" class="usuario">
      <div class="usuario__coluna">
        <section class="cartao cartao--recheio usuario__perfil">
          <Avatar :nome="usuario.fullName" :tamanho="72" />
          <div class="usuario__perfil-texto">
            <h2>{{ usuario.fullName }}</h2>
            <p class="texto-suave">{{ usuario.email }} · {{ usuario.phone }}</p>
            <div class="linha-flex">
              <span class="selo" :class="usuario.role === 'bibliotecario' ? 'selo--verde' : 'selo--cinza'">{{ papel(usuario.role) }}</span>
              <span class="texto-fraco texto-pequeno">cadastro em {{ formatarData(usuario.createdAt) }}</span>
              <span v-if="souEu" class="selo selo--azul">é você</span>
            </div>
          </div>
        </section>

        <section class="cartao cartao--recheio">
          <h3>Dados</h3>
          <dl class="dados">
            <div><dt>Nascimento</dt><dd>{{ formatarData(usuario.birthDate) }}</dd></div>
            <div><dt>Gênero</dt><dd>{{ usuario.gender || '—' }}</dd></div>
            <div><dt>CPF</dt><dd>{{ mascaraCpf(usuario.cpf) }}</dd></div>
            <div><dt>Apelido</dt><dd>{{ usuario.username }}</dd></div>
            <div class="dados__largo"><dt>Endereço</dt><dd>{{ endereco || '—' }}</dd></div>
          </dl>
        </section>

        <section class="cartao cartao--recheio">
          <h3>Permissões</h3>
          <p class="texto-suave">
            <template v-if="usuario.role === 'bibliotecario'">Bibliotecários administram o acervo, as reservas, os usuários e os relatórios.</template>
            <template v-else>Leitores reservam livros, acompanham empréstimos e deixam avaliações.</template>
          </p>
          <div class="linha-flex">
            <button type="button" class="botao botao--secundario" :disabled="souEu || mudandoPapel" :title="souEu ? 'Você não pode alterar o seu próprio papel' : ''" @click="mudarPapel">
              <Icone nome="escudo" :tamanho="16" /> {{ usuario.role === 'bibliotecario' ? 'Rebaixar para leitor(a)' : 'Promover a bibliotecário(a)' }}
            </button>
            <button type="button" class="botao botao--perigo" :disabled="souEu || excluindo" :title="souEu ? 'Você não pode excluir a sua própria conta' : ''" @click="excluir">
              <Icone nome="lixeira" :tamanho="16" /> Excluir usuário
            </button>
          </div>
        </section>
      </div>

      <div class="usuario__coluna">
        <section class="cartao cartao--recheio">
          <h3>Reservas e empréstimos <span class="texto-fraco">({{ reservas.length }})</span></h3>
          <p v-if="emAberto.length" class="aviso-caixa aviso-caixa--ambar"><Icone nome="info" :tamanho="18" /> <span>{{ emAberto.length }} em aberto. Para excluir este usuário, finalize antes.</span></p>
          <Vazio v-if="!reservas.length" compacto icone="marcador" titulo="Nenhuma reserva" texto="Esta pessoa ainda não reservou nenhum livro." />
          <ul v-else class="historico">
            <li v-for="r in reservas" :key="r._id">
              <Capa v-if="r.book" :src="r.book.coverImage" :titulo="r.book.title" tamanho="S" class="historico__capa" />
              <div class="historico__texto">
                <RouterLink v-if="r.book" :to="{ name: 'livro', params: { id: r.book._id } }"><strong>{{ r.book.title }}</strong></RouterLink>
                <strong v-else class="texto-fraco">Livro removido</strong>
                <small class="texto-suave">reservado {{ dataRelativa(r.reservedAt) }}<template v-if="r.loanedAt"> · retirado {{ formatarData(r.loanedAt) }}</template><template v-if="r.returnedAt"> · devolvido {{ formatarData(r.returnedAt) }}</template></small>
              </div>
              <span class="selo" :class="STATUS_RESERVA[r.status].classe">{{ STATUS_RESERVA[r.status].rotulo }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <EditarUsuario v-if="editando && usuario" :usuario="usuario" permitir-cpf @salvo="(d) => (usuario = d)" @fechar="editando = false" />
  </LayoutPainel>
</template>

<style scoped>
.usuario {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 22px;
  align-items: start;
}
.usuario__coluna {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.usuario__perfil {
  display: flex;
  gap: 18px;
  align-items: center;
}
.usuario__perfil-texto h2 {
  font-size: 1.5rem;
  margin-bottom: 2px;
}
.usuario__perfil-texto p {
  margin-bottom: 8px;
}
.cartao h3 {
  font-size: 1.15rem;
  margin-bottom: 14px;
}
.dados {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  margin: 0;
}
.dados__largo {
  grid-column: 1 / -1;
}
.dados dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--tinta-3);
  font-weight: 600;
}
.dados dd {
  margin: 2px 0 0;
  font-weight: 500;
}
.historico {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.historico li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: var(--papel);
}
.historico__capa {
  width: 40px;
  flex: none;
}
.historico__texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.historico__texto a {
  color: inherit;
}
.lista-esqueleto {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (max-width: 1100px) {
  .usuario {
    grid-template-columns: 1fr;
  }
}
</style>
