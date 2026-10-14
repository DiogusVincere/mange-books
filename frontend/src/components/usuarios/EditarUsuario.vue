<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import api, { mensagemDeErro, errosDeCampo } from '@/api';
import { avisar } from '@/avisos';
import { mascaraTelefone, mascaraCep, mascaraCpf, soDigitos } from '@/formato';
import Icone from '@/components/ui/Icone.vue';

// Modal de edição dos dados cadastrais. Serve para a própria pessoa (Minha conta)
// e para o bibliotecário (detalhe do usuário). Emite 'salvo' com o usuário atualizado.
const props = defineProps({
  usuario: { type: Object, required: true },
  permitirCpf: { type: Boolean, default: false },
});
const emit = defineEmits(['salvo', 'fechar']);

const form = reactive({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  cpf: '',
  cep: '',
  numero: '',
  logradouro: '',
  bairro: '',
  cidade: '',
  estado: '',
});
const erros = reactive({});
const salvando = ref(false);
const erroGeral = ref('');

onMounted(() => {
  const u = props.usuario;
  Object.assign(form, {
    fullName: u.fullName || '',
    username: u.username || '',
    email: u.email || '',
    phone: mascaraTelefone(u.phone || ''),
    birthDate: u.birthDate ? String(u.birthDate).slice(0, 10) : '',
    gender: u.gender || '',
    cpf: mascaraCpf(u.cpf || ''),
    cep: mascaraCep((u.address && u.address.cep) || ''),
    numero: (u.address && u.address.numero) || '',
    logradouro: (u.address && u.address.logradouro) || '',
    bairro: (u.address && u.address.bairro) || '',
    cidade: (u.address && u.address.cidade) || '',
    estado: (u.address && u.address.estado) || '',
  });
  document.addEventListener('keydown', tecla);
});
watch(() => form.phone, (v) => { const m = mascaraTelefone(v); if (m !== v) form.phone = m; });
watch(() => form.cep, (v) => { const m = mascaraCep(v); if (m !== v) form.cep = m; });
watch(() => form.cpf, (v) => { const m = mascaraCpf(v); if (m !== v) form.cpf = m; });

function tecla(e) {
  if (e.key === 'Escape') fechar();
}
function fechar() {
  document.removeEventListener('keydown', tecla);
  emit('fechar');
}

async function salvar() {
  for (const k of Object.keys(erros)) delete erros[k];
  erroGeral.value = '';
  salvando.value = true;
  try {
    const corpo = {
      fullName: form.fullName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: soDigitos(form.phone),
      birthDate: form.birthDate,
      gender: form.gender,
      address: {
        cep: soDigitos(form.cep),
        numero: form.numero.trim(),
        logradouro: form.logradouro.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase(),
      },
    };
    if (props.permitirCpf) corpo.cpf = soDigitos(form.cpf);
    const { data } = await api.put(`/api/auth/${props.usuario._id}`, corpo);
    avisar('Dados atualizados.');
    emit('salvo', data);
    fechar();
  } catch (e) {
    Object.assign(erros, errosDeCampo(e));
    erroGeral.value = mensagemDeErro(e, 'Não foi possível salvar.');
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <div class="modal-fundo" @click.self="fechar">
    <div class="modal modal--largo" role="dialog" aria-modal="true" aria-labelledby="titulo-editar">
      <div class="modal__topo">
        <h3 id="titulo-editar">Editar dados</h3>
        <button type="button" class="botao botao--fantasma botao--icone" aria-label="Fechar" @click="fechar"><Icone nome="x" :tamanho="18" /></button>
      </div>
      <div v-if="erroGeral" class="aviso-caixa aviso-caixa--erro"><Icone nome="alerta" :tamanho="18" /> <span>{{ erroGeral }}</span></div>

      <form novalidate @submit.prevent="salvar">
        <div class="campo" :class="{ 'campo--erro': erros.fullName }">
          <label for="e-fullName">Nome completo</label>
          <input id="e-fullName" v-model="form.fullName" type="text" />
          <span v-if="erros.fullName" class="campo__erro">{{ erros.fullName }}</span>
        </div>
        <div class="campos-2">
          <div class="campo" :class="{ 'campo--erro': erros.username }">
            <label for="e-username">Apelido</label>
            <input id="e-username" v-model="form.username" type="text" maxlength="30" />
            <span v-if="erros.username" class="campo__erro">{{ erros.username }}</span>
          </div>
          <div class="campo" :class="{ 'campo--erro': erros.email }">
            <label for="e-email">E-mail</label>
            <input id="e-email" v-model="form.email" type="email" />
            <span v-if="erros.email" class="campo__erro">{{ erros.email }}</span>
          </div>
          <div class="campo" :class="{ 'campo--erro': erros.phone }">
            <label for="e-phone">Telefone</label>
            <input id="e-phone" v-model="form.phone" type="tel" inputmode="numeric" />
            <span v-if="erros.phone" class="campo__erro">{{ erros.phone }}</span>
          </div>
          <div class="campo" :class="{ 'campo--erro': erros.birthDate }">
            <label for="e-birthDate">Data de nascimento</label>
            <input id="e-birthDate" v-model="form.birthDate" type="date" />
            <span v-if="erros.birthDate" class="campo__erro">{{ erros.birthDate }}</span>
          </div>
          <div class="campo" :class="{ 'campo--erro': erros.gender }">
            <label for="e-gender">Gênero</label>
            <select id="e-gender" v-model="form.gender">
              <option>Feminino</option>
              <option>Masculino</option>
              <option>Outro</option>
            </select>
          </div>
          <div v-if="permitirCpf" class="campo" :class="{ 'campo--erro': erros.cpf }">
            <label for="e-cpf">CPF</label>
            <input id="e-cpf" v-model="form.cpf" type="text" inputmode="numeric" />
            <span v-if="erros.cpf" class="campo__erro">{{ erros.cpf }}</span>
          </div>
        </div>

        <p class="campo__rotulo endereco-rotulo">Endereço</p>
        <div class="campos-3">
          <div class="campo" :class="{ 'campo--erro': erros.cep }">
            <label for="e-cep">CEP</label>
            <input id="e-cep" v-model="form.cep" type="text" inputmode="numeric" />
            <span v-if="erros.cep" class="campo__erro">{{ erros.cep }}</span>
          </div>
          <div class="campo"><label for="e-numero">Número</label><input id="e-numero" v-model="form.numero" type="text" /></div>
          <div class="campo"><label for="e-estado">Estado</label><input id="e-estado" v-model="form.estado" type="text" maxlength="2" /></div>
        </div>
        <div class="campos-3">
          <div class="campo"><label for="e-logradouro">Logradouro</label><input id="e-logradouro" v-model="form.logradouro" type="text" /></div>
          <div class="campo"><label for="e-bairro">Bairro</label><input id="e-bairro" v-model="form.bairro" type="text" /></div>
          <div class="campo"><label for="e-cidade">Cidade</label><input id="e-cidade" v-model="form.cidade" type="text" /></div>
        </div>

        <div class="modal__acoes">
          <button type="button" class="botao botao--fantasma" @click="fechar">Cancelar</button>
          <button type="submit" class="botao botao--primario" :disabled="salvando">{{ salvando ? 'Salvando…' : 'Salvar' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal__topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.modal__topo h3 {
  margin: 0;
}
.endereco-rotulo {
  margin: 6px 0 10px;
  padding-top: 14px;
  border-top: 1px solid var(--linha);
}
</style>
