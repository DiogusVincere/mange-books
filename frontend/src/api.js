import axios from 'axios'; // Importa o módulo axios, utilizado para fazer requisições HTTP

// Cria uma instância do axios com uma configuração padrão
const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth', // Define a URL base para as requisições de autenticação
});

// Adicionando interceptor para incluir o token nas requisições
api.interceptors.request.use((config) => { // Define um interceptor para as requisições antes delas serem enviadas
  const token = localStorage.getItem('token'); // Pega o token armazenado no localStorage
  console.log('Token enviado:', token); // Exibe o token no console para depuração
  if (token) { // Verifica se o token existe
    config.headers.Authorization = `Bearer ${token}`; // Adiciona o token no cabeçalho da requisição
  }
  return config; // Retorna a configuração da requisição com o token, se presente
}, (error) => { // Se ocorrer algum erro na configuração da requisição
  return Promise.reject(error); // Rejeita a Promise com o erro
});

export default api; // Exporta a instância do axios para ser usada em outras partes da aplicação
