<template>
    <section class="eventos-futuros">
      <h2>Próximos eventos</h2>
      <div class="carrossel-eventos">
        <div v-for="(evento, index) in eventos" :key="index" class="evento-bloco">
          <div class="evento-cabecalho">
            <p>{{ evento.data }}</p>
          </div>
          <h3>{{ evento.titulo }}</h3>
          <div class="evento-conteudo">
            <img :src="evento.imagem" :alt="'Imagem do evento ' + (index + 1)" />
            <p>{{ evento.descricao }}</p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    data() {
      return {
        eventos: [
          {
            data: '12/10/2024 - 14:00',
            titulo: 'Título do Evento 1',
            imagem: 'imagem-evento1.jpg',
            descricao: 'Descrição curta do evento 1.',
          },
          {
            data: '20/10/2024 - 16:00',
            titulo: 'Título do Evento 2',
            imagem: 'imagem-evento2.jpg',
            descricao: 'Descrição curta do evento 2.',
          },
          {
            data: '30/10/2024 - 18:00',
            titulo: 'Título do Evento 3',
            imagem: 'imagem-evento3.jpg',
            descricao: 'Descrição curta do evento 3.',
          },
          {
            data: '05/11/2024 - 20:00',
            titulo: 'Título do Evento 4',
            imagem: 'imagem-evento4.jpg',
            descricao: 'Descrição curta do evento 4.',
          },
        ],
      };
    },
  };
  </script>
  
  <style scoped>

<style scoped>
/* Estilos globais para todo o site */
body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
}

/* Estilos para links */
a {
    text-decoration: none;
    color: white;
}

/* Seção de eventos futuros */
.eventos-futuros {
    padding: 20px;
}

.eventos-futuros h2 {
    text-align: center;
    font-size: 24px;
    color: #1f2f4f;
}

/* Carrossel de eventos */
.carrossel-eventos {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 20px; /* Espaçamento entre os blocos */
    margin-top: 20px;
}

/* Estilo de cada bloco de evento */
.evento-bloco {
    background-color: white;
    color: black;
    padding: 20px;
    width: 250px;
    border-radius: 10px;
    text-align: left;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Cabeçalho do bloco */
.evento-cabecalho {
    background-color: #1f2f4f;
    color: white;
    padding: 5px;
    border-radius: 5px;
    text-align: center;
}

/* Conteúdo do evento */
.evento-conteudo {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

/* Imagem do evento */
.evento-conteudo img {
    width: 100px;
    height: 100px;
    margin-right: 10px;
    border-radius: 5px;
}

/* Responsividade */
@media (max-width: 768px) {
    .carrossel-eventos {
        justify-content: center;
    }

    .evento-bloco {
        width: 90%; /* Ocupa quase toda a largura da tela */
    }
}

@media (max-width: 480px) {
    .evento-conteudo {
        flex-direction: column; /* Coloca a imagem e o texto em colunas */
        align-items: flex-start;
    }

    .evento-conteudo img {
        margin: 0 0 10px 0; /* Remove margem lateral e adiciona margem inferior */
        width: 100%; /* Ajusta a largura da imagem para caber no espaço */
        height: auto;
    }
}
</style>

  