<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api, { mensagemDeErro } from '@/api';
import { data as formatarData, cpfOculto, papel } from '@/formato';
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import Avatar from '@/components/ui/Avatar.vue';
import Icone from '@/components/ui/Icone.vue';
import Vazio from '@/components/ui/Vazio.vue';

const router = useRouter();
const usuarios = ref([]);
const carregando = ref(true);
const erro = ref('');
const termo = ref('');
const filtroPapel = ref('');

onMounted(carregar);

async function carregar() {
  carregando.value = true;
  erro.value = '';
  try {
    const { data } = await api.get('/api/auth');
    usuarios.value = data;
  } catch (e) {
    erro.value = mensagemDeErro(e, 'Não foi possível carregar os usuários.');
  } finally {
    carregando.value = false;
  }
}

const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const filtrados = computed(() => {
  const q = normalizar(termo.value.trim());
  return usuarios.value.filter((u) => {
    if (filtroPapel.value && u.role !== filtroPapel.value) return false;
    if (!q) return true;
    return [u.fullName, u.username, u.email, u.cpf, u.phone].some((v) => normalizar(v).includes(q));
  });
});
const totais = computed(() => ({
  leitores: usuarios.value.filter((u) => u.role !== 'bibliotecario').length,
  bibliotecarios: usuarios.value.filter((u) => u.role === 'bibliotecario').length,
}));

function abrir(u) {
  router.push({ name: 'painel-usuario', params: { id: u._id } });
}
</script>

<template>
  <LayoutPainel titulo="Usuários" :subtitulo="carregando ? '' : `${totais.leitores} leitores · ${totais.bibliotecarios} ${totais.bibliotecarios === 1 ? 'bibliotecário' : 'bibliotecários'}`">
    <div class="ferramentas cartao">
      <label class="ferramentas__busca">
        <Icone nome="busca" :tamanho="18" />
        <input v-model="termo" type="search" placeholder="Nome, apelido, e-mail, CPF ou telefone" aria-label="Filtrar usuários" />
      </label>
      <select v-model="filtroPapel" aria-label="Papel">
        <option value="">Todos os papéis</option>
        <option value="leitor">Leitores</option>
        <option value="bibliotecario">Bibliotecários</option>
      </select>
    </div>

    <div v-if="carregando" class="lista-esqueleto">
      <span v-for="i in 5" :key="i" class="esqueleto" style="height: 60px" />
    </div>
    <div v-else-if="erro" class="aviso-caixa aviso-caixa--erro"><Icone nome="alerta" :tamanho="18" /> <span>{{ erro }} <button type="button" class="link" @click="carregar">Tentar de novo</button></span></div>
    <Vazio v-else-if="!filtrados.length" icone="usuarios" titulo="Nenhum usuário encontrado" texto="Ajuste a busca ou o filtro de papel." />
    <div v-else class="cartao tabela-envolve">
      <table class="tabela tabela--clicavel">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Contato</th>
            <th>CPF</th>
            <th>Papel</th>
            <th>Cadastro</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtrados" :key="u._id" tabindex="0" @click="abrir(u)" @keydown.enter="abrir(u)">
            <td>
              <div class="celula">
                <Avatar :nome="u.fullName" :tamanho="36" />
                <div class="celula__texto">
                  <strong>{{ u.fullName }}</strong>
                  <small class="texto-suave">@{{ u.username }}</small>
                </div>
              </div>
            </td>
            <td>
              <div class="celula__texto">
                <span>{{ u.email }}</span>
                <small class="texto-suave">{{ u.phone }}</small>
              </div>
            </td>
            <td class="mono">{{ cpfOculto(u.cpf) }}</td>
            <td><span class="selo" :class="u.role === 'bibliotecario' ? 'selo--verde' : 'selo--cinza'">{{ papel(u.role) }}</span></td>
            <td>{{ formatarData(u.createdAt) }}</td>
            <td>
              <div class="tabela__acoes">
                <RouterLink :to="{ name: 'painel-usuario', params: { id: u._id } }" class="botao botao--secundario botao--pequeno" @click.stop>Ver <Icone nome="seta-dir" :tamanho="14" /></RouterLink>
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
.tabela--clicavel tbody tr {
  cursor: pointer;
}
.celula {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}
.celula__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.mono {
  font-variant-numeric: tabular-nums;
  color: var(--tinta-2);
  font-size: 0.88rem;
}
.link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}
</style>
