<script setup>
import { avisos, fecharAviso } from '@/avisos';
import Icone from './Icone.vue';

const ICONE = { sucesso: 'check', erro: 'alerta', aviso: 'info', info: 'info' };
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="a in avisos.lista" :key="a.id" class="toast" :class="`toast--${a.tipo}`" role="status">
        <Icone :nome="ICONE[a.tipo] || 'info'" :tamanho="18" />
        <span class="toast__texto">{{ a.texto }}</span>
        <button class="toast__fechar" type="button" aria-label="Fechar aviso" @click="fecharAviso(a.id)">
          <Icone nome="x" :tamanho="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 200;
  max-width: min(420px, calc(100vw - 40px));
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--tinta);
  color: #fff;
  box-shadow: var(--sombra-2);
  font-size: 0.93rem;
  line-height: 1.4;
}
.toast svg:first-child {
  margin-top: 1px;
}
.toast--sucesso {
  background: var(--verde);
}
.toast--erro {
  background: var(--vermelho);
}
.toast--aviso {
  background: var(--ambar-escuro);
}
.toast__texto {
  flex: 1;
}
.toast__fechar {
  color: inherit;
  opacity: 0.7;
  display: grid;
  place-items: center;
  margin: -2px -4px 0 0;
  padding: 2px;
}
.toast__fechar:hover {
  opacity: 1;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
@media (max-width: 600px) {
  .toasts {
    right: 12px;
    left: 12px;
    bottom: 12px;
    max-width: none;
  }
}
</style>
