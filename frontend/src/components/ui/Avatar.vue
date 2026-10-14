<script setup>
import { computed } from 'vue';
import { iniciais } from '@/formato';

const props = defineProps({
  nome: { type: String, default: '' },
  tamanho: { type: Number, default: 36 },
});

const PALETA = [
  ['#ddeeea', '#1e4d4a'],
  ['#fbeed3', '#a86f12'],
  ['#e0eaf5', '#2f5b8a'],
  ['#f8e0da', '#b3432d'],
  ['#ece3f7', '#5b3f8a'],
  ['#e3efd9', '#3f6b2a'],
];

const cores = computed(() => {
  let soma = 0;
  for (const c of props.nome || '') soma = (soma + c.charCodeAt(0)) % 9973;
  return PALETA[soma % PALETA.length];
});
</script>

<template>
  <span
    class="avatar"
    :style="{
      width: tamanho + 'px',
      height: tamanho + 'px',
      fontSize: Math.round(tamanho * 0.38) + 'px',
      background: cores[0],
      color: cores[1],
    }"
    :title="nome"
    aria-hidden="true"
  >
    {{ iniciais(nome) }}
  </span>
</template>

<style scoped>
.avatar {
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex: none;
  user-select: none;
}
</style>
