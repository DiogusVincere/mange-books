<script setup>
import { ref, computed } from 'vue';

// Exibição (valor com decimais) ou escolha (editavel). Uso:
//   <Estrelas :valor="4.3" />           <Estrelas v-model:valor="nota" editavel />
const props = defineProps({
  valor: { type: Number, default: 0 },
  editavel: { type: Boolean, default: false },
  tamanho: { type: Number, default: 16 },
});
const emit = defineEmits(['update:valor']);

const sobre = ref(0);
const mostrado = computed(() => (props.editavel && sobre.value ? sobre.value : props.valor || 0));
const largura = computed(() => `${Math.max(0, Math.min(5, mostrado.value)) * 20}%`);
const ROTULOS = ['', 'Ruim', 'Fraco', 'Bom', 'Muito bom', 'Excelente'];

function escolher(n) {
  if (props.editavel) emit('update:valor', n);
}
</script>

<template>
  <span
    class="estrelas"
    :class="{ 'estrelas--editavel': editavel }"
    :style="{ '--tam': tamanho + 'px' }"
    :role="editavel ? 'radiogroup' : 'img'"
    :aria-label="editavel ? 'Nota' : `${(valor || 0).toFixed(1)} de 5`"
    @mouseleave="sobre = 0"
  >
    <span class="estrelas__fundo" aria-hidden="true">
      <svg v-for="n in 5" :key="'f' + n" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    </span>
    <span class="estrelas__cheias" :style="{ width: largura }" aria-hidden="true">
      <svg v-for="n in 5" :key="'c' + n" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    </span>
    <span v-if="editavel" class="estrelas__botoes">
      <button
        v-for="n in 5"
        :key="'b' + n"
        type="button"
        role="radio"
        :aria-checked="valor === n"
        :aria-label="`${n} ${n === 1 ? 'estrela' : 'estrelas'}: ${ROTULOS[n]}`"
        :title="ROTULOS[n]"
        @mouseenter="sobre = n"
        @focus="sobre = n"
        @blur="sobre = 0"
        @click="escolher(n)"
      />
    </span>
  </span>
</template>

<style scoped>
.estrelas {
  position: relative;
  display: inline-block;
  line-height: 0;
  white-space: nowrap;
  width: calc(var(--tam) * 5 + 8px);
  height: var(--tam);
  vertical-align: middle;
}
.estrelas__fundo,
.estrelas__cheias {
  position: absolute;
  inset: 0 auto 0 0;
  display: flex;
  gap: 2px;
  overflow: hidden;
}
.estrelas__fundo svg,
.estrelas__cheias svg {
  width: var(--tam);
  height: var(--tam);
  flex: none;
}
.estrelas__fundo svg {
  fill: #e1dbcf;
}
.estrelas__cheias svg {
  fill: var(--ambar);
}
.estrelas__botoes {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 2px;
}
.estrelas__botoes button {
  width: var(--tam);
  height: var(--tam);
  flex: none;
  cursor: pointer;
  border-radius: 3px;
}
.estrelas--editavel {
  cursor: pointer;
}
.estrelas--editavel .estrelas__fundo svg {
  transition: fill 0.15s;
}
</style>
