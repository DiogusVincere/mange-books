<script setup>
import { ref, watch, nextTick } from 'vue';
import { dialogo, responder } from '@/confirmar';

const botaoConfirmar = ref(null);

watch(
  () => dialogo.aberto,
  async (aberto) => {
    if (aberto) {
      await nextTick();
      if (botaoConfirmar.value) botaoConfirmar.value.focus();
    }
  },
);

function tecla(e) {
  if (e.key === 'Escape') responder(false);
}
</script>

<template>
  <Transition name="fade">
    <div v-if="dialogo.aberto" class="modal-fundo" @click.self="responder(false)" @keydown="tecla">
      <div class="modal confirmar" role="alertdialog" aria-modal="true" :aria-label="dialogo.titulo">
        <h3>{{ dialogo.titulo }}</h3>
        <p v-if="dialogo.texto" class="texto-suave">{{ dialogo.texto }}</p>
        <div class="modal__acoes">
          <button type="button" class="botao botao--fantasma" @click="responder(false)">{{ dialogo.cancelar }}</button>
          <button
            ref="botaoConfirmar"
            type="button"
            class="botao"
            :class="dialogo.perigo ? 'botao--perigo' : 'botao--primario'"
            @click="responder(true)"
          >
            {{ dialogo.confirmar }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.confirmar {
  width: min(100%, 440px);
}
.confirmar p {
  margin-bottom: 0;
}
</style>
