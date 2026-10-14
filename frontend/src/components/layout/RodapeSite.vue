<script setup>
import { sessao } from '@/sessao';
import { GENEROS } from '@/formato';
import Logo from './Logo.vue';
import Icone from '@/components/ui/Icone.vue';

const logado = sessao.logado;
const ano = new Date().getFullYear();
</script>

<template>
  <footer class="rodape">
    <div class="conteiner rodape__grade">
      <div class="rodape__sobre">
        <Logo claro />
        <p>Catálogo, reservas e avaliações de uma biblioteca, num só lugar. Encontre o próximo livro, reserve pelo site e retire no balcão.</p>
      </div>
      <div>
        <h4>Navegação</h4>
        <ul>
          <li><RouterLink :to="{ name: 'inicio' }">Início</RouterLink></li>
          <li><RouterLink :to="{ name: 'catalogo' }">Catálogo</RouterLink></li>
          <li v-if="logado"><RouterLink :to="{ name: 'conta' }">Minha conta</RouterLink></li>
          <li v-if="logado"><RouterLink :to="{ name: 'minhas-reservas' }">Minhas reservas</RouterLink></li>
          <li v-if="!logado"><RouterLink :to="{ name: 'entrar' }">Entrar</RouterLink></li>
          <li v-if="!logado"><RouterLink :to="{ name: 'cadastro' }">Criar conta</RouterLink></li>
        </ul>
      </div>
      <div>
        <h4>Gêneros</h4>
        <ul>
          <li v-for="g in GENEROS" :key="g">
            <RouterLink :to="{ name: 'catalogo', query: { genero: g } }">{{ g }}</RouterLink>
          </li>
        </ul>
      </div>
      <div>
        <h4>Sobre o projeto</h4>
        <p class="rodape__stack">Vue 3 e Vite no front, Node/Express e MongoDB na API.</p>
        <a class="rodape__github" href="https://github.com/DiogusVincere/mange-books" target="_blank" rel="noopener">
          <Icone nome="github" :tamanho="18" /> Código no GitHub
        </a>
      </div>
    </div>
    <div class="rodape__base">
      <div class="conteiner rodape__base-linha">
        <span>© {{ ano }} Mange Books · projeto acadêmico</span>
        <span>Ambiente de demonstração: os dados voltam ao padrão quando o servidor reinicia.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.rodape {
  background: var(--tinta);
  color: rgba(255, 255, 255, 0.78);
  margin-top: auto;
}
.rodape__grade {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
  gap: 32px;
  padding-block: 56px 40px;
}
.rodape__sobre p {
  margin-top: 16px;
  max-width: 360px;
  font-size: 0.95rem;
}
.rodape h4 {
  color: #fff;
  margin-bottom: 14px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.rodape ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rodape a {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
}
.rodape a:hover {
  color: #fff;
  text-decoration: underline;
}
.rodape__stack {
  font-size: 0.92rem;
}
.rodape__github {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #fff !important;
}
.rodape__base {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-block: 18px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.55);
}
.rodape__base-linha {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
@media (max-width: 900px) {
  .rodape__grade {
    grid-template-columns: 1fr 1fr;
  }
  .rodape__sobre {
    grid-column: 1 / -1;
  }
}
@media (max-width: 520px) {
  .rodape__grade {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-block: 40px 28px;
  }
}
</style>
