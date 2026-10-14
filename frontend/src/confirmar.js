// Diálogo de confirmação baseado em promessa.
// Uso: if (await confirmar({ titulo: 'Excluir?', texto: '...', perigo: true })) { ... }
import { reactive } from 'vue';

export const dialogo = reactive({
  aberto: false,
  titulo: '',
  texto: '',
  confirmar: 'Confirmar',
  cancelar: 'Cancelar',
  perigo: false,
  resolver: null,
});

export function confirmar({ titulo, texto = '', confirmar: rotulo = 'Confirmar', cancelar = 'Cancelar', perigo = false }) {
  return new Promise((resolve) => {
    Object.assign(dialogo, { aberto: true, titulo, texto, confirmar: rotulo, cancelar, perigo, resolver: resolve });
  });
}

export function responder(valor) {
  dialogo.aberto = false;
  if (dialogo.resolver) dialogo.resolver(valor);
  dialogo.resolver = null;
}
