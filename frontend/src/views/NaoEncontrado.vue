<script setup>
import LayoutSite from '@/components/layout/LayoutSite.vue';
import Icone from '@/components/ui/Icone.vue';
</script>

<template>
  <LayoutSite>
    <div class="conteiner pagina nao-encontrado">
      <p class="nao-encontrado__codigo">404</p>
      <h1>Esta página saiu da estante</h1>
      <p class="texto-suave">O endereço não existe ou foi movido. Que tal voltar ao catálogo e escolher outro livro?</p>
      <div class="linha-flex nao-encontrado__botoes">
        <RouterLink :to="{ name: 'inicio' }" class="botao botao--primario"><Icone nome="casa" :tamanho="18" /> Página inicial</RouterLink>
        <RouterLink :to="{ name: 'catalogo' }" class="botao botao--secundario"><Icone nome="livro-aberto" :tamanho="18" /> Ver catálogo</RouterLink>
      </div>
    </div>
  </LayoutSite>
</template>

<style scoped>
.nao-encontrado {
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.nao-encontrado__codigo {
  font-family: var(--fonte-titulo);
  font-size: clamp(5rem, 14vw, 9rem);
  font-weight: 700;
  line-height: 1;
  color: var(--verde-claro);
  margin: 0 0 8px;
  text-shadow: 0 2px 0 var(--linha-2);
}
.nao-encontrado__botoes {
  justify-content: center;
  margin-top: 8px;
}
</style>
