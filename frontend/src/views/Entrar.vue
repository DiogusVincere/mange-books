<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api, { mensagemDeErro } from '@/api';
import { sessao } from '@/sessao';
import { avisar } from '@/avisos';
import { primeiroNome } from '@/formato';
import Logo from '@/components/layout/Logo.vue';
import Icone from '@/components/ui/Icone.vue';

const route = useRoute();
const router = useRouter();

const form = reactive({ email: String(route.query.email || ''), password: '' });
const mostrarSenha = ref(false);
const enviando = ref(false);
const erro = ref('');
const campoEmail = ref(null);

const DEMOS = [
  { rotulo: 'Bibliotecária', descricao: 'acervo, reservas, usuários e relatórios', email: 'demo@demo.com', senha: 'demo1234', icone: 'escudo' },
  { rotulo: 'Leitor', descricao: 'reservar, avaliar e acompanhar empréstimos', email: 'leitor@demo.com', senha: 'demo1234', icone: 'usuario' },
];

onMounted(() => {
  if (campoEmail.value && !form.email) campoEmail.value.focus();
});

async function entrar(email = form.email, senha = form.password) {
  erro.value = '';
  enviando.value = true;
  try {
    const { data } = await api.post('/api/auth/login', { email, password: senha });
    await sessao.entrar(data.token, data.usuario);
    avisar(`Olá, ${primeiroNome(data.usuario.fullName)}! Boa leitura.`);
    const destino = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : null;
    router.push(destino || { name: 'inicio' });
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível entrar.');
  } finally {
    enviando.value = false;
  }
}

function usarDemo(d) {
  form.email = d.email;
  form.password = d.senha;
  entrar(d.email, d.senha);
}
</script>

<template>
  <div class="auth">
    <aside class="auth__painel">
      <RouterLink :to="{ name: 'inicio' }" class="auth__marca"><Logo claro /></RouterLink>
      <div class="auth__painel-texto">
        <h2>Bem-vindo de volta.</h2>
        <p>Entre para reservar livros, acompanhar seus empréstimos e deixar avaliações.</p>
        <ul>
          <li><Icone nome="marcador" :tamanho="18" /> Reserve pelo site e retire no balcão</li>
          <li><Icone nome="estrela" :tamanho="18" /> Avalie o que leu e ajude outros leitores</li>
          <li><Icone nome="relogio" :tamanho="18" /> Veja o histórico de tudo o que já pegou</li>
        </ul>
      </div>
      <p class="auth__rodape">© Mange Books · projeto acadêmico</p>
    </aside>

    <main class="auth__conteudo">
      <RouterLink :to="{ name: 'inicio' }" class="auth__voltar"><Icone nome="seta-esq" :tamanho="16" /> Voltar ao site</RouterLink>
      <div class="auth__caixa">
        <h1>Entrar</h1>
        <p class="texto-suave">Use seu e-mail e senha, ou experimente com uma conta de demonstração.</p>

        <div v-if="erro" class="aviso-caixa aviso-caixa--erro" role="alert">
          <Icone nome="alerta" :tamanho="18" /> <span>{{ erro }}</span>
        </div>

        <form @submit.prevent="entrar()" novalidate>
          <div class="campo">
            <label for="email">E-mail</label>
            <input id="email" ref="campoEmail" v-model.trim="form.email" type="email" autocomplete="email" required placeholder="voce@exemplo.com" />
          </div>
          <div class="campo campo--com-botao">
            <label for="senha">Senha</label>
            <input id="senha" v-model="form.password" :type="mostrarSenha ? 'text' : 'password'" autocomplete="current-password" required placeholder="Sua senha" />
            <button type="button" class="campo__botao" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'" @click="mostrarSenha = !mostrarSenha">
              <Icone :nome="mostrarSenha ? 'olho-fechado' : 'olho'" :tamanho="18" />
            </button>
          </div>
          <button type="submit" class="botao botao--primario botao--bloco botao--grande" :disabled="enviando || !form.email || !form.password">
            {{ enviando ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>

        <div class="divisor"><span>ou use uma conta de demonstração</span></div>

        <div class="demos">
          <button v-for="d in DEMOS" :key="d.email" type="button" class="demo" :disabled="enviando" @click="usarDemo(d)">
            <span class="demo__icone"><Icone :nome="d.icone" :tamanho="20" /></span>
            <span class="demo__texto">
              <strong>{{ d.rotulo }}</strong>
              <small>{{ d.descricao }}</small>
              <code>{{ d.email }} · {{ d.senha }}</code>
            </span>
            <Icone nome="seta-dir" :tamanho="18" class="demo__seta" />
          </button>
        </div>

        <p class="auth__alternativa">
          Ainda não tem conta? <RouterLink :to="{ name: 'cadastro' }">Criar conta grátis</RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 42%) 1fr;
  background: var(--papel);
}
.auth__painel {
  background:
    radial-gradient(700px 400px at 100% 0%, rgba(217, 150, 43, 0.25), transparent 60%),
    linear-gradient(160deg, #163f3c, #1e4d4a 60%, #23605b);
  color: #fff;
  padding: 36px 44px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
}
.auth__marca {
  text-decoration: none;
  align-self: flex-start;
}
.auth__painel-texto h2 {
  color: #fff;
  font-size: clamp(2rem, 1.5rem + 1.6vw, 2.8rem);
}
.auth__painel-texto > p {
  color: rgba(255, 255, 255, 0.82);
  font-size: 1.05rem;
  max-width: 420px;
}
.auth__painel-texto ul {
  list-style: none;
  padding: 0;
  margin: 28px 0 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.auth__painel-texto li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
}
.auth__painel-texto li svg {
  color: var(--ambar);
}
.auth__rodape {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
}
.auth__conteudo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 56px;
}
.auth__voltar {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tinta-2);
  font-size: 0.9rem;
  margin-bottom: 24px;
}
.auth__caixa {
  width: min(100%, 440px);
  margin: auto 0;
}
.auth__caixa h1 {
  margin-bottom: 6px;
}
.auth__caixa > .texto-suave {
  margin-bottom: 24px;
}
.divisor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 26px 0 16px;
  color: var(--tinta-3);
  font-size: 0.82rem;
}
.divisor::before,
.divisor::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--linha-2);
}
.demos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.demo {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--linha-2);
  background: var(--superficie);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}
.demo:hover:not(:disabled) {
  border-color: var(--verde-2);
  box-shadow: var(--sombra-1);
}
.demo:disabled {
  opacity: 0.6;
  cursor: wait;
}
.demo__icone {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--verde-claro);
  color: var(--verde);
  display: grid;
  place-items: center;
  flex: none;
}
.demo__texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.demo__texto small {
  color: var(--tinta-2);
}
.demo__texto code {
  font-size: 0.75rem;
  color: var(--tinta-3);
  margin-top: 2px;
}
.demo__seta {
  color: var(--tinta-3);
}
.auth__alternativa {
  margin: 26px 0 0;
  text-align: center;
  color: var(--tinta-2);
}
.auth__alternativa a {
  font-weight: 600;
}
@media (max-width: 860px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth__painel {
    padding: 24px 20px;
    gap: 20px;
  }
  .auth__painel-texto ul,
  .auth__rodape {
    display: none;
  }
  .auth__painel-texto h2 {
    font-size: 1.6rem;
    margin-bottom: 4px;
  }
  .auth__painel-texto > p {
    margin: 0;
    font-size: 0.95rem;
  }
  .auth__conteudo {
    padding: 20px 16px 40px;
  }
}
</style>
