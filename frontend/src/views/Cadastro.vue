<script setup>
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import api, { mensagemDeErro, errosDeCampo } from '@/api';
import { avisar } from '@/avisos';
import { mascaraCpf, mascaraTelefone, mascaraCep, soDigitos } from '@/formato';
import Logo from '@/components/layout/Logo.vue';
import Icone from '@/components/ui/Icone.vue';

const router = useRouter();

const form = reactive({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  gender: '',
  cpf: '',
  phone: '',
  cep: '',
  numero: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  estado: '',
});
const erros = reactive({});
const erroGeral = ref('');
const enviando = ref(false);
const mostrarSenha = ref(false);
const buscandoCep = ref(false);
const cepEncontrado = ref(false);

// Máscaras
watch(() => form.cpf, (v) => { const m = mascaraCpf(v); if (m !== v) form.cpf = m; });
watch(() => form.phone, (v) => { const m = mascaraTelefone(v); if (m !== v) form.phone = m; });
watch(() => form.cep, (v) => {
  const m = mascaraCep(v);
  if (m !== v) form.cep = m;
  if (soDigitos(m).length === 8) buscarCep();
  else cepEncontrado.value = false;
});

async function buscarCep() {
  const cep = soDigitos(form.cep);
  if (cep.length !== 8) return;
  buscandoCep.value = true;
  delete erros.cep;
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 8000 });
    if (data.erro) {
      erros.cep = 'CEP não encontrado';
      cepEncontrado.value = false;
      return;
    }
    form.logradouro = data.logradouro || '';
    form.bairro = data.bairro || '';
    form.cidade = data.localidade || '';
    form.estado = data.uf || '';
    cepEncontrado.value = true;
  } catch (e) {
    // ViaCEP fora do ar: deixa a pessoa preencher à mão
    cepEncontrado.value = false;
  } finally {
    buscandoCep.value = false;
  }
}

function validar() {
  for (const k of Object.keys(erros)) delete erros[k];
  if (form.fullName.trim().length < 3) erros.fullName = 'Informe o nome completo';
  if (form.username.trim().length < 3) erros.username = 'Pelo menos 3 caracteres';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) erros.email = 'E-mail inválido';
  if (form.password.length < 6) erros.password = 'Pelo menos 6 caracteres';
  if (form.confirmPassword !== form.password) erros.confirmPassword = 'As senhas não coincidem';
  if (!form.birthDate || new Date(form.birthDate) > new Date()) erros.birthDate = 'Data inválida';
  if (!form.gender) erros.gender = 'Selecione uma opção';
  if (soDigitos(form.cpf).length !== 11) erros.cpf = 'CPF deve ter 11 dígitos';
  if (soDigitos(form.phone).length < 10) erros.phone = 'Informe o telefone com DDD';
  if (soDigitos(form.cep).length !== 8) erros.cep = 'CEP deve ter 8 dígitos';
  if (!form.numero.trim()) erros.numero = 'Informe o número';
  return Object.keys(erros).length === 0;
}

async function enviar() {
  erroGeral.value = '';
  if (!validar()) {
    erroGeral.value = 'Confira os campos destacados.';
    return;
  }
  enviando.value = true;
  try {
    await api.post('/api/auth/register', {
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      birthDate: form.birthDate,
      gender: form.gender,
      cpf: soDigitos(form.cpf),
      phone: soDigitos(form.phone),
      address: {
        cep: soDigitos(form.cep),
        numero: form.numero.trim(),
        logradouro: form.logradouro,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
      },
    });
    avisar('Conta criada! Agora é só entrar.');
    router.push({ name: 'entrar', query: { email: form.email.trim() } });
  } catch (e) {
    Object.assign(erros, errosDeCampo(e));
    erroGeral.value = mensagemDeErro(e, 'Não foi possível concluir o cadastro.');
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="auth">
    <aside class="auth__painel">
      <RouterLink :to="{ name: 'inicio' }" class="auth__marca"><Logo claro /></RouterLink>
      <div class="auth__painel-texto">
        <h2>Crie sua conta de leitor.</h2>
        <p>É rápido e gratuito. Depois de cadastrado, você reserva livros pelo site e retira no balcão.</p>
        <ul>
          <li><Icone nome="check" :tamanho="18" /> Até três reservas ao mesmo tempo</li>
          <li><Icone nome="check" :tamanho="18" /> Histórico de empréstimos sempre à mão</li>
          <li><Icone nome="check" :tamanho="18" /> Avaliações que ajudam outros leitores</li>
        </ul>
      </div>
      <p class="auth__rodape">© Mange Books · projeto acadêmico</p>
    </aside>

    <main class="auth__conteudo">
      <RouterLink :to="{ name: 'inicio' }" class="auth__voltar"><Icone nome="seta-esq" :tamanho="16" /> Voltar ao site</RouterLink>
      <div class="auth__caixa auth__caixa--larga">
        <h1>Criar conta</h1>
        <p class="texto-suave">Preencha os dados abaixo. Esta é uma demonstração: use dados fictícios à vontade.</p>

        <div v-if="erroGeral" class="aviso-caixa aviso-caixa--erro" role="alert">
          <Icone nome="alerta" :tamanho="18" /> <span>{{ erroGeral }}</span>
        </div>

        <form novalidate @submit.prevent="enviar">
          <fieldset>
            <legend>Acesso</legend>
            <div class="campos-2">
              <div class="campo" :class="{ 'campo--erro': erros.email }">
                <label for="email">E-mail</label>
                <input id="email" v-model="form.email" type="email" autocomplete="email" placeholder="voce@exemplo.com" />
                <span v-if="erros.email" class="campo__erro">{{ erros.email }}</span>
              </div>
              <div class="campo" :class="{ 'campo--erro': erros.username }">
                <label for="username">Apelido</label>
                <input id="username" v-model="form.username" type="text" autocomplete="username" placeholder="Como quer ser chamado" maxlength="30" />
                <span v-if="erros.username" class="campo__erro">{{ erros.username }}</span>
              </div>
              <div class="campo campo--com-botao" :class="{ 'campo--erro': erros.password }">
                <label for="password">Senha</label>
                <input id="password" v-model="form.password" :type="mostrarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="Mínimo de 6 caracteres" />
                <button type="button" class="campo__botao" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'" @click="mostrarSenha = !mostrarSenha">
                  <Icone :nome="mostrarSenha ? 'olho-fechado' : 'olho'" :tamanho="18" />
                </button>
                <span v-if="erros.password" class="campo__erro">{{ erros.password }}</span>
              </div>
              <div class="campo" :class="{ 'campo--erro': erros.confirmPassword }">
                <label for="confirmPassword">Confirmar senha</label>
                <input id="confirmPassword" v-model="form.confirmPassword" :type="mostrarSenha ? 'text' : 'password'" autocomplete="new-password" placeholder="Repita a senha" />
                <span v-if="erros.confirmPassword" class="campo__erro">{{ erros.confirmPassword }}</span>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Dados pessoais</legend>
            <div class="campo" :class="{ 'campo--erro': erros.fullName }">
              <label for="fullName">Nome completo</label>
              <input id="fullName" v-model="form.fullName" type="text" autocomplete="name" />
              <span v-if="erros.fullName" class="campo__erro">{{ erros.fullName }}</span>
            </div>
            <div class="campos-2">
              <div class="campo" :class="{ 'campo--erro': erros.birthDate }">
                <label for="birthDate">Data de nascimento</label>
                <input id="birthDate" v-model="form.birthDate" type="date" autocomplete="bday" />
                <span v-if="erros.birthDate" class="campo__erro">{{ erros.birthDate }}</span>
              </div>
              <div class="campo" :class="{ 'campo--erro': erros.gender }">
                <label for="gender">Gênero</label>
                <select id="gender" v-model="form.gender">
                  <option value="" disabled>Selecione</option>
                  <option>Feminino</option>
                  <option>Masculino</option>
                  <option>Outro</option>
                </select>
                <span v-if="erros.gender" class="campo__erro">{{ erros.gender }}</span>
              </div>
              <div class="campo" :class="{ 'campo--erro': erros.cpf }">
                <label for="cpf">CPF</label>
                <input id="cpf" v-model="form.cpf" type="text" inputmode="numeric" placeholder="000.000.000-00" />
                <span v-if="erros.cpf" class="campo__erro">{{ erros.cpf }}</span>
              </div>
              <div class="campo" :class="{ 'campo--erro': erros.phone }">
                <label for="phone">Telefone</label>
                <input id="phone" v-model="form.phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="(19) 99999-9999" />
                <span v-if="erros.phone" class="campo__erro">{{ erros.phone }}</span>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Endereço</legend>
            <div class="campos-3">
              <div class="campo" :class="{ 'campo--erro': erros.cep }">
                <label for="cep">CEP</label>
                <input id="cep" v-model="form.cep" type="text" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" />
                <span v-if="erros.cep" class="campo__erro">{{ erros.cep }}</span>
                <span v-else-if="buscandoCep" class="campo__dica">Buscando endereço…</span>
                <span v-else-if="cepEncontrado" class="campo__dica">Endereço preenchido pelo CEP</span>
              </div>
              <div class="campo" :class="{ 'campo--erro': erros.numero }">
                <label for="numero">Número</label>
                <input id="numero" v-model="form.numero" type="text" placeholder="123" />
                <span v-if="erros.numero" class="campo__erro">{{ erros.numero }}</span>
              </div>
              <div class="campo">
                <label for="estado">Estado</label>
                <input id="estado" v-model="form.estado" type="text" maxlength="2" :readonly="cepEncontrado" placeholder="SP" />
              </div>
            </div>
            <div class="campos-3">
              <div class="campo">
                <label for="logradouro">Logradouro</label>
                <input id="logradouro" v-model="form.logradouro" type="text" :readonly="cepEncontrado" placeholder="Rua, avenida…" />
              </div>
              <div class="campo">
                <label for="bairro">Bairro</label>
                <input id="bairro" v-model="form.bairro" type="text" :readonly="cepEncontrado" />
              </div>
              <div class="campo">
                <label for="cidade">Cidade</label>
                <input id="cidade" v-model="form.cidade" type="text" :readonly="cepEncontrado" />
              </div>
            </div>
          </fieldset>

          <button type="submit" class="botao botao--primario botao--bloco botao--grande" :disabled="enviando">
            {{ enviando ? 'Criando conta…' : 'Criar conta' }}
          </button>
        </form>

        <p class="auth__alternativa">
          Já tem conta? <RouterLink :to="{ name: 'entrar' }">Entrar</RouterLink>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(300px, 36%) 1fr;
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
  position: sticky;
  top: 0;
  height: 100vh;
}
.auth__marca {
  text-decoration: none;
  align-self: flex-start;
}
.auth__painel-texto h2 {
  color: #fff;
  font-size: clamp(2rem, 1.5rem + 1.6vw, 2.6rem);
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
  width: min(100%, 720px);
}
.auth__caixa h1 {
  margin-bottom: 6px;
}
.auth__caixa > .texto-suave {
  margin-bottom: 24px;
}
fieldset {
  border: 0;
  padding: 22px 22px 8px;
  margin: 0 0 18px;
  background: var(--superficie);
  border: 1px solid var(--linha);
  border-radius: var(--raio);
}
legend {
  padding: 0 8px;
  font-family: var(--fonte-titulo);
  font-weight: 600;
  font-size: 1.15rem;
  color: var(--verde);
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
    position: static;
    height: auto;
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
  fieldset {
    padding: 16px 14px 4px;
  }
}
</style>
