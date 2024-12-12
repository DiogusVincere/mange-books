<template>
    <div>
      <Header />
      <BannerCarousel />
      <UltimosAdicionados />
      <EncontreSuaArea />
      <EventosFuturos />
      <Footer />
    </div>
  </template>
  
  <script>
  import Header from '@/components/Header.vue';
  import BannerCarousel from '@/components/BannerCarousel.vue';
  import UltimosAdicionados from '@/components/UltimosAdicionados.vue';
  import EncontreSuaArea from '@/components/EncontreSuaArea.vue';
  import EventosFuturos from '@/components/EventosFuturos.vue';
  import Footer from '@/components/Footer.vue';
  
  export default {
    components: {
      Header,
      BannerCarousel,
      UltimosAdicionados,
      EncontreSuaArea,
      EventosFuturos,
      Footer
    },
  };
  </script>

<style scoped>
/* fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap');

/* Estilos globais para todo o site */
body {
    /* Define a fonte do texto para todo o site */
    font-family: 'Roboto', sans-serif;
    /* Remove as margens padrão do body */
    margin: 0;
    /* Remove o padding padrão do body */
    padding: 0;
    /* Cor de fundo clara para o site */
    background-color: #f0f0f0;
}

/* Estilos para links */
a {
    /* Remove o sublinhado dos links */
    text-decoration: none;
    /* Define a cor do texto dos links como branco */
    color: white;
}

/* Cabeçalho da página */
header {
    /* Cor de fundo do cabeçalho */
    background-color: #FF1A0A;
    /* Adiciona um padding ao redor do cabeçalho */
    padding: 20px;
}

/* Parte superior do cabeçalho (logo, pesquisa, ícones) */
.top-header {
    /* Exibe os elementos de forma flexível para alinhamento */
    display: flex;
    /* Distribui o conteúdo entre as extremidades (logo à esquerda e ícones à direita) */
    justify-content: space-between;
    /* Alinha os itens verticalmente ao centro */
    align-items: center;
}

/* Estilos para a logo e nome da biblioteca */
.logo {
    /* Exibe os itens (logo e nome) em linha */
    display: flex;
    /* Alinha os itens verticalmente ao centro */
    align-items: center;
}

.logo img {
    /* Define a altura da logo */
    height: 50px;
    /* Adiciona um espaço entre a logo e o nome da biblioteca */
    margin-right: 10px;
}

/* Nome da biblioteca ao lado da logo */
.library-name {
    /* Tamanho da fonte do nome da biblioteca */
    font-size: 24px;
    /* Define o peso da fonte como negrito */
    font-weight: bold;
    /* Cor do texto em branco */
    color: white;
}

/* Área da barra de pesquisa e ícones de perfil, carrinho, etc. */
.search-profile {
    /* Exibe os itens (barra de pesquisa e ícones) em linha */
    display: flex;
    /* Alinha os itens verticalmente ao centro */
    align-items: center;
}

/* Barra de pesquisa */
.search-bar {
    /* Define o padding interno da barra de pesquisa */
    padding: 10px;
    /* Tamanho da fonte dentro da barra de pesquisa */
    font-size: 16px;
    /* Remove bordas */
    border: none;
    /* Bordas arredondadas */
    border-radius: 5px;
    /* Margem à direita da barra de pesquisa */
    margin-right: 30px;
    width: 300px; /* Aumenta a largura */
    /* Define a altura da barra de pesquisa */
}

/* Área dos ícones de perfil, carrinho e favoritos */
.profile-actions {
    /* Exibe os itens (ícones e links) em linha */
    display: flex;
    /* Alinha os itens verticalmente ao centro */
    align-items: center;
}

.profile-actions img {
    /* Define a altura dos ícones */
    height: 30px;
    /* Margem entre os ícones */
    margin: 0 10px;
}

/* Links de autenticação (Entrar, Cadastrar) */
.auth-link {
    /* Margem entre os links de autenticação */
    margin: 0 5px;
}

/* Barra de navegação inferior */
.bottom-header {
    /* Margem superior para distanciar da parte superior do cabeçalho */
    margin-top: 15px;
}

/* Lista de itens do menu */
.bottom-header ul {
    /* Remove os marcadores da lista */
    list-style: none;
    /* Exibe os itens em linha */
    display: flex;
    /* Distribui os itens igualmente ao longo da largura */
    justify-content: space-around;
    /* Remove padding da lista */
    padding: 0;
}

/* Estilos para os links do menu */
.bottom-header ul li a {
    /* Cor dos links do menu (branca) */
    color: white;
    /* Tamanho da fonte */
    font-size: 18px;
    /* Padding ao redor dos links */
    padding: 10px 20px;
}


/* Segunda parte: Últimos adicionados */

/* Estilos para o carrossel de banners */
.carrossel-banners {
    width: 100%;
    overflow: hidden; /* Oculta os banners que estão fora da área visível */
    position: relative;
    height: 300px; /* Altura fixa do contêiner do carrossel */
}

.banners-container {
    display: flex;
    transition: transform 1s ease-in-out; /* Transição suave */
    width: 300%; /* Cada banner ocupa 100%, então 3 banners = 300% */
}

.banner {
    min-width: 100%; /* Cada banner ocupa 100% da largura do carrossel */
    height: 300px; /* Altura fixa para cada banner */
    overflow: hidden; /* Garante que nada que ultrapasse o banner seja escondido */
}

.banner img {
    width: 100%; /* A imagem ocupa 100% da largura do banner */
    height: 100%; /* A imagem ocupa 100% da altura do banner */
    object-fit: cover; /* Cobre a área definida, mantendo as proporções */
}

/* Segunda parte: Últimos adicionados */
.carrossel-livros-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carrossel-livros {
    display: flex;
    overflow: hidden; /* Oculta os livros que estão fora da área visível */
    width: 80%;
}

.livro-slot {
    text-align: center;
    flex: 0 0 20%; /* Cada livro ocupa 20% da largura do carrossel */
    transition: transform 0.3s ease-in-out; /* Transição suave ao deslizar */
}

.prev-btn, .next-btn {
    background-color: #1F2F4F;
    color: white;
    border: none;
    cursor: pointer;
    padding: 10px;
    font-size: 18px;
    position: absolute;
}

.prev-btn {
    left: 10px;
}

.next-btn {
    right: 10px;
}



.ultimos-adicionados {
    padding: 20px;
    text-align: center;
}

.titulo-carrossel {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.titulo-carrossel h2 {
    font-size: 24px;
    color: #1F2F4F;
}

.ver-todos {
    font-size: 14px;
    color: #1F2F4F;
    text-decoration: none;
}

.carrossel-livros {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

.livro-slot {
    text-align: center;
}

.livro-slot img {
    width: 120px;
    height: 180px;
}

.livro-slot p {
    color: #1F2F4F;
    margin-top: 10px;
}

/* Linha separadora cinza claro */
.separador {
    border: 1px solid lightgray;
    margin: 20px 0;
}

/* Terceira parte: Encontre sua área */
.encontre-sua-area {
    padding: 20px;
    text-align: center;
}

.linha-generos {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
}

.linha-generos button {
    padding: 10px 20px;
    background-color: #1F2F4F;
    color: white;
    border: none;
    cursor: pointer;
}

/* Quarta parte: Carrossel de eventos */
.eventos-futuros {
    padding: 20px;
    text-align: center;
}

.carrossel-eventos {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

.evento-bloco {
    background-color: white;
    color: black;
    padding: 20px;
    width: 250px;
    border-radius: 10px;
    text-align: left;
}

.evento-cabecalho {
    background-color: #1F2F4F;
    color: white;
    padding: 5px;
    border-radius: 5px;
}

.evento-conteudo {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.evento-conteudo img {
    width: 100px;
    height: 100px;
    margin-right: 10px;
}

.evento-conteudo p {
    flex: 1;
}



/* Estilos para o rodapé */
footer {
    /* Cor de fundo do rodapé */
    background-color: #FF1A0A;
    /* Cor do texto em branco */
    color: white;
    /* Centraliza o texto e o conteúdo */
    text-align: center;
    /* Padding interno no rodapé */
    padding: 20px 10px;
}

/* Estilo para a logo no rodapé */
footer .footer-logo img {
    /* Altura da logo no rodapé */
    height: 50px;
    /* Margem inferior da logo */
    margin-bottom: 10px;
}

/* Estilos para os parágrafos do rodapé */
footer p {
    /* Margem entre os parágrafos */
    margin: 5px 0;
}
</style>