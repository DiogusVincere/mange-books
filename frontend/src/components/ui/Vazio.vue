<script setup>
import Icone from './Icone.vue';

defineProps({
  icone: { type: String, default: 'livro-aberto' },
  titulo: { type: String, required: true },
  texto: { type: String, default: '' },
  compacto: { type: Boolean, default: false },
});
</script>

<template>
  <div class="vazio" :class="{ 'vazio--compacto': compacto }">
    <div class="vazio__icone"><Icone :nome="icone" :tamanho="compacto ? 26 : 34" :espessura="1.6" /></div>
    <h3 class="vazio__titulo">{{ titulo }}</h3>
    <p v-if="texto" class="vazio__texto">{{ texto }}</p>
    <div v-if="$slots.default" class="vazio__acao"><slot /></div>
  </div>
</template>

<style scoped>
.vazio {
  text-align: center;
  padding: 56px 20px;
  border: 1px dashed var(--linha-2);
  border-radius: var(--raio);
  background: rgba(255, 255, 255, 0.5);
}
.vazio--compacto {
  padding: 32px 16px;
}
.vazio__icone {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: var(--verde-claro);
  color: var(--verde);
  display: grid;
  place-items: center;
}
.vazio--compacto .vazio__icone {
  width: 50px;
  height: 50px;
}
.vazio__titulo {
  font-size: 1.2rem;
  margin-bottom: 6px;
}
.vazio__texto {
  color: var(--tinta-2);
  max-width: 420px;
  margin: 0 auto;
}
.vazio__acao {
  margin-top: 18px;
}
</style>
