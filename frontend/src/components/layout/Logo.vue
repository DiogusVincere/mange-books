<script setup>
defineProps({
  claro: { type: Boolean, default: false },
  somenteMarca: { type: Boolean, default: false },
});
</script>

<template>
  <span class="logo" :class="{ 'logo--claro': claro }">
    <svg class="logo__marca" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" class="logo__fundo" />
      <path d="M14 18c6-3 11-3 18 1v29c-7-4-12-4-18-1z" class="logo__pagina" />
      <path d="M50 18c-6-3-11-3-18 1v29c7-4 12-4 18-1z" class="logo__pagina logo__pagina--destaque" />
      <path d="M32 19v29" class="logo__lombada" />
    </svg>
    <span v-if="!somenteMarca" class="logo__texto">Mange<span class="logo__texto-b">Books</span></span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--tinta);
  text-decoration: none;
}
.logo__marca {
  width: 36px;
  height: 36px;
  flex: none;
}
.logo__fundo {
  fill: var(--verde);
}
.logo__pagina {
  fill: #f6f1e8;
}
.logo__pagina--destaque {
  fill: var(--ambar);
}
.logo__lombada {
  stroke: var(--verde);
  stroke-width: 2;
}
.logo__texto {
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: -0.01em;
  line-height: 1;
}
.logo__texto-b {
  color: var(--verde-2);
  margin-left: 0.18em;
}
.logo--claro {
  color: #fff;
}
.logo--claro .logo__fundo {
  fill: rgba(255, 255, 255, 0.14);
}
.logo--claro .logo__lombada {
  stroke: rgba(0, 0, 0, 0.25);
}
.logo--claro .logo__texto-b {
  color: var(--ambar);
}
</style>
