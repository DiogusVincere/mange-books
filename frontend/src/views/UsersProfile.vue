<template>
    <div class="user-profile-layout">
      <HeaderProfile class="header" />
      <Sidebar class="sidebar" />
      <main class="main-content">
        <div class="user-and-loan">
          <UserProfile class="user-profile" />
          <LoanHistory class="loan-history" />
        </div>
      </main>
      <FooterProfile class="footer" />
    </div>
  </template>
  
  <script>
  import HeaderProfile from '../components/HeaderProfile.vue';
  import FooterProfile from '../components/FooterProfile.vue';
  import Sidebar from '../components/Sidebar.vue';
  import UserProfile from '../components/UserProfile.vue';
  import LoanHistory from '../components/LoanHistory.vue';
  
  export default {
  components: {
    HeaderProfile,
    Sidebar,
    UserProfile,
    LoanHistory,
    FooterProfile,
  },
};
</script>

<style scoped>
/* Configuração do layout principal */
.user-profile-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-rows: auto 1fr auto; /* Tamanho flexível */
  grid-template-columns: 250px 1fr; /* Sidebar fixa e conteúdo fluido */
  min-height: 100vh;
}

/* Estilo para cada componente */
.header {
  grid-area: header;
  background-color: #282828;
  color: white;
  padding: 10px;
}

.sidebar {
  grid-area: sidebar;
  background-color: #383838;
  color: white;
  padding: 20px;
}

.main-content {
  grid-area: main;
  padding: 20px;
  background-color: #f4f4f4;
}

/* Posicionamento de UserProfile e LoanHistory */
.user-and-loan {
  display: flex;
  gap: 20px; /* Espaço entre UserProfile e LoanHistory */
}

.user-profile {
  flex: 2; /* Ocupará 2/3 do espaço disponível */
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loan-history {
  flex: 1; /* Ocupará 1/3 do espaço disponível */
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.footer {
  grid-area: footer;
  background-color: #282828;
  color: white;
  text-align: center;
  padding: 10px;
}

/* Media Queries para Responsividade */
@media (max-width: 1024px) {
  .user-profile-layout {
    grid-template-columns: 1fr; /* Sidebar fica acima do conteúdo */
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "footer";
  }

  .sidebar {
    text-align: center; /* Melhorar visual na tela menor */
    padding: 10px;
  }

  .user-and-loan {
    flex-direction: column; /* Empilhar UserProfile e LoanHistory */
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px; /* Reduzir espaçamento */
  }

  .user-profile,
  .loan-history {
    min-width: 100%; /* Ocupam toda a largura disponível */
  }
}

@media (max-width: 480px) {
  .header,
  .footer {
    padding: 5px; /* Reduzir padding para telas muito pequenas */
    font-size: 14px;
  }

  .sidebar {
    padding: 10px 5px;
    font-size: 14px;
  }

  .user-profile,
  .loan-history {
    padding: 10px;
  }
}
</style>