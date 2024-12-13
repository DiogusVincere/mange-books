<template>
  <!-- Contêiner do carrossel -->
  <div class="carrossel-container">
    <!-- Carrossel de imagens, o estilo é alterado dinamicamente -->
    <div class="carrossel" :style="carouselStyle">
      <!-- Itera sobre os itens e exibe cada um com sua imagem -->
      <div class="carrossel-item" v-for="(item, index) in items" :key="index">
        <!-- Imagem do item do carrossel -->
        <img :src="item.image" :alt="item.title" />
      </div>
    </div>

    <!-- Botão para mover para o item anterior -->
    <button class="prev" @click="moveToPrevious">←</button>
    <!-- Botão para mover para o próximo item -->
    <button class="next" @click="moveToNext">→</button>
  </div>
</template>

<script>
import banner1 from '@/assets/img/banner2.jfif'; // Importa a imagem do primeiro banner
import banner2 from '@/assets/img/banner2.jpg'; // Importa a imagem do segundo banner
import banner3 from '@/assets/img/banner4.jfif'; // Importa a imagem do terceiro banner

export default {
  data() {
    return {
      // Dados do carrossel, incluindo o título e a imagem de cada item
      items: [
        { title: "Item 1", image: banner1 },
        { title: "Item 2", image: banner2 },
        { title: "Item 3", image: banner3 },
      ],
      currentIndex: 0, // Índice do item atualmente visível no carrossel
    };
  },
  computed: {
    // Computa o estilo dinâmico para o carrossel com base no índice atual
    carouselStyle() {
      return {
        transform: `translateX(-${this.currentIndex * 100}%)`, // Translada o carrossel conforme o índice
        transition: 'transform 0.5s ease', // Transição suave para a mudança de imagem
      };
    }
  },
  methods: {
    // Método para mover para o próximo item
    moveToNext() {
      if (this.currentIndex < this.items.length - 1) { // Verifica se ainda há itens à frente
        this.currentIndex++; // Avança para o próximo item
      } else {
        this.currentIndex = 0; // Se estiver no último item, volta para o primeiro
      }
    },
    // Método para mover para o item anterior
    moveToPrevious() {
      if (this.currentIndex > 0) { // Verifica se não está no primeiro item
        this.currentIndex--; // Volta para o item anterior
      } else {
        this.currentIndex = this.items.length - 1; // Se estiver no primeiro item, vai para o último
      }
    }
  }
};
</script>

<style scoped>
/* Estilo para o contêiner do carrossel */
.carrossel-container {
  position: relative; /* Permite o posicionamento absoluto dos botões */
  width: 100%; /* O carrossel ocupa toda a largura disponível */
  overflow: hidden; /* Esconde o conteúdo que sai da área visível */
}

/* Estilo para o carrossel de itens */
.carrossel {
  display: flex; /* Organiza os itens horizontalmente */
  transition: transform 0.5s ease; /* Transição suave para a mudança de posição */
}

/* Estilo para cada item do carrossel */
.carrossel-item {
  min-width: 100%; /* Cada item ocupa 100% da largura do contêiner */
  transition: opacity 0.5s ease; /* Transição suave de opacidade */
}

/* Estilo para a imagem de cada item */
.carrossel-item img {
  width: 100%; /* A imagem ocupa toda a largura do item */
  height: auto; /* A altura da imagem é ajustada automaticamente */
}

/* Estilo para os botões de navegação */
button {
  position: absolute; /* Posiciona os botões de forma absoluta */
  top: 50%; /* Alinha os botões verticalmente ao centro */
  background-color: rgba(0, 0, 0, 0.5); /* Fundo semitransparente para os botões */
  color: white; /* Texto dos botões em branco */
  border: none; /* Remove a borda padrão dos botões */
  padding: 10px; /* Espaçamento interno dos botões */
  cursor: pointer; /* Muda o cursor para pointer ao passar o mouse */
  font-size: 18px; /* Tamanho da fonte do texto do botão */
}

/* Estilo para o botão "anterior" */
button.prev {
  left: 10px; /* Alinha o botão à esquerda */
  transform: translateY(-50%); /* Ajusta para que o botão fique no centro verticalmente */
}

/* Estilo para o botão "próximo" */
button.next {
  right: 10px; /* Alinha o botão à direita */
  transform: translateY(-50%); /* Ajusta para que o botão fique no centro verticalmente */
}
</style>
