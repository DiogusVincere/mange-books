// Avisos rápidos (toasts). Uso: avisar('Livro reservado!'), avisar('Erro', 'erro').
import { reactive } from 'vue';

export const avisos = reactive({ lista: [] });
let sequencia = 0;

export function avisar(texto, tipo = 'sucesso', duracao = 4200) {
  const id = ++sequencia;
  avisos.lista.push({ id, texto, tipo });
  if (avisos.lista.length > 4) avisos.lista.shift();
  setTimeout(() => fecharAviso(id), duracao);
  return id;
}

export function fecharAviso(id) {
  const indice = avisos.lista.findIndex((a) => a.id === id);
  if (indice >= 0) avisos.lista.splice(indice, 1);
}
