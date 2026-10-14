<script setup>
import CabecalhoSite from './CabecalhoSite.vue';
import RodapeSite from './RodapeSite.vue';
</script>

<template>
  <div class="site">
    <CabecalhoSite />
    <main class="site__principal">
      <slot />
    </main>
    <RodapeSite />
  </div>
</template>

<style scoped>
.site {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.site__principal {
  flex: 1;
}
</style>
