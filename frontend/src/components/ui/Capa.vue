<script setup>
import { ref, computed, watch } from 'vue';
import { urlImagem } from '@/api';

// Capa de livro com proporção fixa e um substituto bonito quando não há imagem.
const props = defineProps({
  src: { type: String, default: '' },
  titulo: { type: String, default: '' },
  autor: { type: String, default: '' },
  tamanho: { type: String, default: 'M' }, // S, M ou L (capas da Open Library)
  prioritaria: { type: Boolean, default: false },
});

const falhou = ref(false);
watch(() => props.src, () => {
  falhou.value = false;
});
const url = computed(() => urlImagem(props.src, props.tamanho));
</script>

<template>
  <div class="capa" :class="{ 'capa--vazia': !url || falhou }">
    <img
      v-if="url && !falhou"
      :src="url"
      :alt="titulo ? `Capa de ${titulo}` : 'Capa do livro'"
      :loading="prioritaria ? 'eager' : 'lazy'"
      decoding="async"
      @error="falhou = true"
    />
    <div v-else class="capa__substituto" aria-hidden="true">
      <span class="capa__titulo">{{ titulo || 'Sem capa' }}</span>
      <span v-if="autor" class="capa__autor">{{ autor }}</span>
    </div>
  </div>
</template>

<style scoped>
.capa {
  position: relative;
  aspect-ratio: 2 / 3;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--papel-2);
  box-shadow: inset 0 0 0 1px rgba(27, 36, 48, 0.06);
}
.capa img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.capa__substituto {
  position: absolute;
  inset: 0;
  padding: 14% 12%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.25), transparent 60%),
    linear-gradient(200deg, var(--verde-3), var(--verde) 70%);
  color: #fff;
  border-left: 6px solid rgba(0, 0, 0, 0.18);
}
.capa__titulo {
  font-family: var(--fonte-titulo);
  font-weight: 600;
  font-size: clamp(0.8rem, 1.2vw + 0.4rem, 1.1rem);
  line-height: 1.2;
}
.capa__autor {
  font-size: 0.72rem;
  opacity: 0.85;
}
</style>
