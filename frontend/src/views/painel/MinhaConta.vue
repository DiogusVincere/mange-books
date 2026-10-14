<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api, { mensagemDeErro } from '@/api';
import { sessao } from '@/sessao';
import { avisar } from '@/avisos';
import { data as formatarData, dataRelativa, cpfOculto, mascaraCep, papel, STATUS_RESERVA } from '@/formato';
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import EditarUsuario from '@/components/usuarios/EditarUsuario.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Capa from '@/components/ui/Capa.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const usuario = computed(() => sessao.estado.usuario);
const editando = ref(false);
const senhaAberta = ref(false);
const senha = reactive({ atual: '', nova: '', confirmar: '' });
const trocando = ref(false);
const erroSenha = ref('');
const mostrar = ref(false);

const reservas = ref([]);
const carregandoReservas = ref(true);
const emAberto = computed(() => reservas.value.filter((r) => ['Reservado', 'Emprestado'].includes(r.status)));
const totalLidos = computed(() => reservas.value.filter((r) => r.status === 'Devolvido').length);

onMounted(async () => {
  sessao.carregar(true);
  try {
    const { data } = await api.get('/api/reservations');
    reservas.value = data;
  } catch (e) {
    // sem reservas listadas: a página continua útil
  } finally {
    carregandoReservas.value = false;
  }
});

function salvo(dados) {
  sessao.atualizarUsuario(dados);
}

function abrirSenha() {
  senha.atual = '';
  senha.nova = '';
  senha.confirmar = '';
  erroSenha.value = '';
  senhaAberta.value = true;
}

async function trocarSenha() {
  erroSenha.value = '';
  if (senha.nova.length < 6) {
    erroSenha.value = 'A nova senha deve ter pelo menos 6 caracteres.';
    return;
  }
  if (senha.nova !== senha.confirmar) {
    erroSenha.value = 'A confirmação não bate com a nova senha.';
    return;
  }
  trocando.value = true;
  try {
    await api.put('/api/auth/me/senha', { senhaAtual: senha.atual, novaSenha: senha.nova });
    avisar('Senha alterada.');
    senhaAberta.value = false;
  } catch (e) {
    erroSenha.value = mensagemDeErro(e);
  } finally {
    trocando.value = false;
  }
}

const endereco = computed(() => {
  const a = (usuario.value && usuario.value.address) || {};
  const linha1 = [a.logradouro, a.numero].filter(Boolean).join(', ');
  const linha2 = [a.bairro, a.cidade && a.estado ? `${a.cidade} - ${a.estado}` : a.cidade || a.estado].filter(Boolean).join(' · ');
  return { linha1, linha2, cep: a.cep ? mascaraCep(a.cep) : '' };
});
</script>

<template>
  <LayoutPainel titulo="Minha conta" subtitulo="Seus dados, suas reservas e a sua senha">
    <template #acoes>
      <button type="button" class="botao botao--secundario" @click="editando = true"><Icone nome="editar" :tamanho="16" /> Editar dados</button>
      <button type="button" class="botao botao--fantasma" @click="abrirSenha"><Icone nome="cadeado" :tamanho="16" /> Alterar senha</button>
    </template>

    <div v-if="usuario" class="conta">
      <div class="conta__coluna">
        <section class="cartao cartao--recheio conta__perfil">
          <Avatar :nome="usuario.fullName" :tamanho="76" />
          <div class="conta__perfil-texto">
            <h2>{{ usuario.fullName }}</h2>
            <p class="texto-suave">@{{ usuario.username }} · {{ usuario.email }}</p>
            <div class="linha-flex">
              <span class="selo" :class="usuario.role === 'bibliotecario' ? 'selo--verde' : 'selo--cinza'">{{ papel(usuario.role) }}</span>
              <span v-if="usuario.createdAt" class="texto-fraco texto-pequeno">na biblioteca desde {{ formatarData(usuario.createdAt) }}</span>
            </div>
          </div>
          <dl class="conta__numeros">
            <div><dt>{{ emAberto.length }}</dt><dd>em aberto</dd></div>
            <div><dt>{{ totalLidos }}</dt><dd>{{ totalLidos === 1 ? 'devolvido' : 'devolvidos' }}</dd></div>
          </dl>
        </section>

        <section class="cartao cartao--recheio">
          <h3>Dados pessoais</h3>
          <dl class="dados">
            <div><dt>Nome</dt><dd>{{ usuario.fullName }}</dd></div>
            <div><dt>Apelido</dt><dd>{{ usuario.username }}</dd></div>
            <div><dt>E-mail</dt><dd>{{ usuario.email }}</dd></div>
            <div><dt>Telefone</dt><dd>{{ usuario.phone || '—' }}</dd></div>
            <div><dt>Nascimento</dt><dd>{{ formatarData(usuario.birthDate) }}</dd></div>
            <div><dt>Gênero</dt><dd>{{ usuario.gender || '—' }}</dd></div>
            <div>
              <dt>CPF</dt>
              <dd class="linha-flex">
                {{ mostrar ? usuario.cpf : cpfOculto(usuario.cpf) }}
                <button type="button" class="botao botao--fantasma botao--pequeno" @click="mostrar = !mostrar">
                  <Icone :nome="mostrar ? 'olho-fechado' : 'olho'" :tamanho="14" /> {{ mostrar ? 'ocultar' : 'mostrar' }}
                </button>
              </dd>
            </div>
          </dl>
        </section>

        <section class="cartao cartao--recheio">
          <h3>Endereço</h3>
          <p v-if="endereco.linha1 || endereco.linha2" class="endereco">
            <Icone nome="pino" :tamanho="18" />
            <span>
              {{ endereco.linha1 }}<br />
              <span class="texto-suave">{{ endereco.linha2 }}<template v-if="endereco.cep"> · CEP {{ endereco.cep }}</template></span>
            </span>
          </p>
          <p v-else class="texto-suave">Nenhum endereço cadastrado.</p>
        </section>
      </div>

      <div class="conta__coluna">
        <section class="cartao cartao--recheio">
          <div class="secao__cabecalho conta__cabecalho-reservas">
            <h3>Em aberto</h3>
            <RouterLink :to="{ name: 'minhas-reservas' }" class="botao botao--fantasma botao--pequeno">Ver todas <Icone nome="seta-dir" :tamanho="14" /></RouterLink>
          </div>
          <div v-if="carregandoReservas" class="lista-esqueleto">
            <span v-for="i in 2" :key="i" class="esqueleto" style="height: 76px" />
          </div>
          <Vazio
            v-else-if="!emAberto.length"
            compacto
            icone="marcador"
            titulo="Nenhuma reserva em aberto"
            texto="Escolha um livro disponível no catálogo e reserve. Ele fica guardado para você."
          >
            <RouterLink :to="{ name: 'catalogo', query: { disponiveis: '1' } }" class="botao botao--primario botao--pequeno">Ver disponíveis</RouterLink>
          </Vazio>
          <ul v-else class="reservas-mini">
            <li v-for="r in emAberto" :key="r._id">
              <RouterLink :to="{ name: 'livro', params: { id: r.book._id } }" class="reservas-mini__capa">
                <Capa :src="r.book.coverImage" :titulo="r.book.title" tamanho="S" />
              </RouterLink>
              <div class="reservas-mini__texto">
                <RouterLink :to="{ name: 'livro', params: { id: r.book._id } }"><strong>{{ r.book.title }}</strong></RouterLink>
                <small class="texto-suave">{{ r.book.author }}</small>
                <small class="texto-fraco">
                  {{ r.status === 'Emprestado' ? `retirado ${dataRelativa(r.loanedAt)}` : `reservado ${dataRelativa(r.reservedAt)}` }}
                </small>
              </div>
              <span class="selo" :class="STATUS_RESERVA[r.status].classe">{{ STATUS_RESERVA[r.status].rotulo }}</span>
            </li>
          </ul>
        </section>

        <section v-if="usuario.role === 'bibliotecario'" class="cartao cartao--recheio conta__atalhos">
          <h3>Atalhos da biblioteca</h3>
          <RouterLink :to="{ name: 'painel-reservas' }" class="atalho"><Icone nome="caixa" :tamanho="20" /><span><strong>Reservas e empréstimos</strong><small>Registrar retiradas e devoluções</small></span><Icone nome="seta-dir" :tamanho="16" /></RouterLink>
          <RouterLink :to="{ name: 'painel-livro-novo' }" class="atalho"><Icone nome="mais" :tamanho="20" /><span><strong>Cadastrar livro</strong><small>Novo título no acervo</small></span><Icone nome="seta-dir" :tamanho="16" /></RouterLink>
          <RouterLink :to="{ name: 'painel-relatorios' }" class="atalho"><Icone nome="grafico" :tamanho="20" /><span><strong>Relatórios</strong><small>Números do acervo e dos leitores</small></span><Icone nome="seta-dir" :tamanho="16" /></RouterLink>
        </section>
      </div>
    </div>
    <div v-else class="lista-esqueleto">
      <span class="esqueleto" style="height: 140px" />
      <span class="esqueleto" style="height: 240px" />
    </div>

    <EditarUsuario v-if="editando && usuario" :usuario="usuario" @salvo="salvo" @fechar="editando = false" />

    <Transition name="fade">
      <div v-if="senhaAberta" class="modal-fundo" @click.self="senhaAberta = false">
        <form class="modal" novalidate @submit.prevent="trocarSenha">
          <h3>Alterar senha</h3>
          <div v-if="erroSenha" class="aviso-caixa aviso-caixa--erro"><Icone nome="alerta" :tamanho="18" /> <span>{{ erroSenha }}</span></div>
          <div class="campo">
            <label for="s-atual">Senha atual</label>
            <input id="s-atual" v-model="senha.atual" type="password" autocomplete="current-password" required />
          </div>
          <div class="campos-2">
            <div class="campo">
              <label for="s-nova">Nova senha</label>
              <input id="s-nova" v-model="senha.nova" type="password" autocomplete="new-password" required minlength="6" />
              <span class="campo__dica">Mínimo de 6 caracteres</span>
            </div>
            <div class="campo">
              <label for="s-confirmar">Confirmar nova senha</label>
              <input id="s-confirmar" v-model="senha.confirmar" type="password" autocomplete="new-password" required />
            </div>
          </div>
          <div class="modal__acoes">
            <button type="button" class="botao botao--fantasma" @click="senhaAberta = false">Cancelar</button>
            <button type="submit" class="botao botao--primario" :disabled="trocando || !senha.atual || !senha.nova">{{ trocando ? 'Salvando…' : 'Salvar nova senha' }}</button>
          </div>
        </form>
      </div>
    </Transition>
  </LayoutPainel>
</template>

<style scoped>
.conta {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 22px;
  align-items: start;
}
.conta__coluna {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.conta__perfil {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}
.conta__perfil-texto {
  flex: 1;
  min-width: 200px;
}
.conta__perfil-texto h2 {
  font-size: 1.6rem;
  margin-bottom: 2px;
}
.conta__perfil-texto p {
  margin-bottom: 10px;
}
.conta__numeros {
  display: flex;
  gap: 22px;
  margin: 0;
  padding-left: 22px;
  border-left: 1px solid var(--linha);
}
.conta__numeros dt {
  font-family: var(--fonte-titulo);
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1;
}
.conta__numeros dd {
  margin: 4px 0 0;
  color: var(--tinta-3);
  font-size: 0.82rem;
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
.endereco {
  display: flex;
  gap: 10px;
  margin: 0;
  line-height: 1.5;
}
.endereco svg {
  color: var(--verde);
  flex: none;
  margin-top: 3px;
}
.conta__cabecalho-reservas {
  margin-bottom: 10px;
}
.conta__cabecalho-reservas h3 {
  margin: 0;
}
.reservas-mini {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.reservas-mini li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: var(--papel);
}
.reservas-mini__capa {
  width: 44px;
  flex: none;
}
.reservas-mini__texto {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.reservas-mini__texto a {
  color: inherit;
}
.reservas-mini__texto strong {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lista-esqueleto {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.conta__atalhos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.conta__atalhos h3 {
  margin-bottom: 6px;
}
.atalho {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--papel);
  color: inherit;
  text-decoration: none !important;
  transition: background 0.15s;
}
.atalho:hover {
  background: var(--verde-claro);
}
.atalho > svg:first-child {
  color: var(--verde);
}
.atalho span {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.atalho small {
  color: var(--tinta-2);
}
@media (max-width: 1100px) {
  .conta {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .dados {
    grid-template-columns: 1fr;
  }
  .conta__numeros {
    padding-left: 0;
    border-left: 0;
  }
}
</style>
