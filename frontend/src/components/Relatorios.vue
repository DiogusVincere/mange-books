<template>
  <div class="relatorios">
    <h2>Relatórios</h2>

    <!-- Gráfico de Livros Mais Reservados -->
    <div>
      <h3>Livros Mais Reservados</h3>
      <canvas id="booksChart"></canvas>
    </div>

    <!-- Gráfico de Usuários Mais Ativos -->
    <div>
      <h3>Usuários Mais Ativos</h3>
      <canvas id="usersChart"></canvas>
    </div>

    <!-- Gráfico de Avaliações de Livros -->
    <div>
      <h3>Livros com Melhores Avaliações</h3>
      <canvas id="ratingsChart"></canvas>
    </div>

    <!-- Exportação -->
    <div class="export-buttons">
      <button @click="exportToPDF">Exportar como PDF</button>
      <button @click="exportToExcel">Exportar como Excel</button>
    </div>
  </div>
</template>

<script>
// Importação do Chart.js com a maneira correta para o Vite
import { Chart } from 'chart.js/auto';
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export default {
  mounted() {
    this.createCharts();
  },
  methods: {
    createCharts() {
      // Gráfico de Livros Mais Reservados
      new Chart(document.getElementById("booksChart"), {
        type: "bar",
        data: {
          labels: [
            "Harry Potter e a Pedra Filosofal",
            "O Senhor dos Anéis: A Sociedade do Anel",
            "O Hobbit",
            "1984",
            "Dom Casmurro"
          ],
          datasets: [
            {
              label: "Reservas",
              data: [25, 40, 35, 30, 22],
              backgroundColor: ["#FF1A0A", "#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
            }
          ]
        }
      });

      // Gráfico de Usuários Mais Ativos
      new Chart(document.getElementById("usersChart"), {
        type: "bar",
        data: {
          labels: [
            "Ana Silva",
            "Carlos Souza",
            "Maria Oliveira",
            "Pedro Santos",
            "Juliana Costa"
          ],
          datasets: [
            {
              label: "Reservas",
              data: [15, 30, 25, 10, 20],
              backgroundColor: ["#FF1A0A", "#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
            }
          ]
        }
      });

      // Gráfico de Avaliações de Livros
      new Chart(document.getElementById("ratingsChart"), {
        type: "bar",
        data: {
          labels: [
            "Harry Potter e a Pedra Filosofal",
            "O Senhor dos Anéis: A Sociedade do Anel",
            "O Hobbit",
            "1984",
            "Dom Casmurro"
          ],
          datasets: [
            {
              label: "Avaliações",
              data: [4.9, 4.8, 4.7, 4.5, 4.6],
              backgroundColor: ["#FF1A0A", "#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
            }
          ]
        }
      });
    },

    exportToPDF() {
      const doc = new jsPDF();
      doc.text("Relatório de Livros Mais Reservados", 10, 10);

      // Captura a imagem do gráfico
      doc.addImage(document.getElementById("booksChart"), "JPEG", 10, 20, 180, 120);
      doc.save("relatorio-livros.pdf");
    },

    exportToExcel() {
      const wb = XLSX.utils.book_new();
      
      // Dados para exportação de livros mais reservados
      const wsBooks = XLSX.utils.aoa_to_sheet([
        ["Livro", "Reservas"],
        ["Harry Potter e a Pedra Filosofal", 25],
        ["O Senhor dos Anéis: A Sociedade do Anel", 40],
        ["O Hobbit", 35],
        ["1984", 30],
        ["Dom Casmurro", 22]
      ]);
      XLSX.utils.book_append_sheet(wb, wsBooks, "Livros Mais Reservados");

      // Exporta como Excel
      XLSX.writeFile(wb, "relatorio-livros.xlsx");
    },
  }
};
</script>

<style scoped>
.relatorios {
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.export-buttons {
  text-align: center;
  margin-top: 20px;
}

.export-buttons button {
  background-color: #ff1a0a;
  color: white;
  border: none;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
}

.export-buttons button:hover {
  background-color: #cc0000;
}

/* Tamanho fixo para os gráficos */
canvas {
  max-width: 500px;  /* Tamanho máximo do gráfico */
  width: 100%;       /* Responsividade */
  height: 300px;     /* Altura do gráfico */
}
</style>
