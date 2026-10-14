<script setup>
import LayoutPainel from '@/components/layout/LayoutPainel.vue';
import FormularioLivro from '@/components/livros/FormularioLivro.vue';
import Icone from '@/components/ui/Icone.vue';

const props = defineProps({ id: { type: String, default: '' } });
</script>

<template>
  <LayoutPainel
    :titulo="id ? 'Editar livro' : 'Novo livro'"
    :subtitulo="id ? 'Altere os dados e salve. A capa só muda se você enviar outra.' : 'Preencha os dados do título. A capa pode vir de um arquivo, de uma URL ou da Open Library pelo ISBN.'"
  >
    <template #acoes>
      <RouterLink :to="{ name: 'painel-livros' }" class="botao botao--fantasma"><Icone nome="seta-esq" :tamanho="16" /> Voltar ao acervo</RouterLink>
    </template>
    <FormularioLivro :id="props.id" :key="props.id || 'novo'" />
  </LayoutPainel>
</template>
