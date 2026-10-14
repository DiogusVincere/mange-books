<script setup>
import { SITUACOES } from '@/formato';
import Capa from '@/components/ui/Capa.vue';
import Estrelas from '@/components/ui/Estrelas.vue';

defineProps({
  livro: { type: Object, required: true },
  mostrarSituacao: { type: Boolean, default: true },
});
</script>

<template>
  <RouterLink :to="{ name: 'livro', params: { id: livro._id } }" class="cartao-livro">
    <div class="cartao-livro__capa">
      <Capa :src="livro.coverImage" :titulo="livro.title" :autor="livro.author" tamanho="M" />
      <span
        v-if="mostrarSituacao && livro.situacao && livro.situacao !== 'disponivel'"
        class="selo cartao-livro__selo"
        :class="SITUACOES[livro.situacao].classe"
      >
        {{ SITUACOES[livro.situacao].rotulo }}
      </span>
    </div>
    <div class="cartao-livro__texto">
      <h3 class="cartao-livro__titulo">{{ livro.title }}</h3>
      <p class="cartao-livro__autor">{{ livro.author }}</p>
      <p class="cartao-livro__nota">
        <template v-if="livro.notaMedia">
          <Estrelas :valor="livro.notaMedia" :tamanho="13" />
          <span>{{ livro.notaMedia.toFixed(1) }}</span>
          <span class="texto-fraco">({{ livro.totalAvaliacoes }})</span>
        </template>
        <span v-else class="texto-fraco">Sem avaliações</span>
      </p>
    </div>
  </RouterLink>
</template>

<style scoped>
.cartao-livro {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: inherit;
  text-decoration: none !important;
  border-radius: 12px;
}
.cartao-livro__capa {
  position: relative;
  border-radius: 10px;
  box-shadow: 0 10px 24px -10px rgba(27, 36, 48, 0.45);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.cartao-livro:hover .cartao-livro__capa {
  transform: translateY(-6px);
  box-shadow: 0 22px 36px -14px rgba(27, 36, 48, 0.55);
}
.cartao-livro__selo {
  position: absolute;
  top: 8px;
  left: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
.cartao-livro__texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cartao-livro__titulo {
  font-family: var(--fonte-texto);
  font-size: 0.98rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cartao-livro:hover .cartao-livro__titulo {
  color: var(--verde);
}
.cartao-livro__autor {
  margin: 0;
  font-size: 0.86rem;
  color: var(--tinta-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cartao-livro__nota {
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--tinta-2);
}
</style>
