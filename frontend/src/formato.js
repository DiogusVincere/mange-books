// Funções de formatação usadas pelas telas.

export const GENEROS = ['Fantasia', 'Terror', 'Drama', 'Suspense', 'Ação', 'Ficção'];

export function data(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}

export function dataHora(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  return isNaN(d) ? '—' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function dataRelativa(valor) {
  if (!valor) return '';
  const diff = Date.now() - new Date(valor).getTime();
  const dias = Math.floor(diff / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
  const anos = Math.floor(dias / 365);
  return anos === 1 ? 'há 1 ano' : `há ${anos} anos`;
}

export const soDigitos = (v) => String(v || '').replace(/\D/g, '');

export function mascaraCpf(v) {
  const d = soDigitos(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraTelefone(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function mascaraCep(v) {
  return soDigitos(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

// CPF exibido parcialmente oculto (***.456.789-**)
export function cpfOculto(v) {
  const d = soDigitos(v);
  if (d.length !== 11) return v || '—';
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}

export function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function primeiroNome(nome) {
  return String(nome || '').trim().split(/\s+/)[0] || '';
}

export const SITUACOES = {
  disponivel: { rotulo: 'Disponível', classe: 'selo--verde' },
  reservado: { rotulo: 'Reservado', classe: 'selo--ambar' },
  emprestado: { rotulo: 'Emprestado', classe: 'selo--vermelho' },
};

export const STATUS_RESERVA = {
  Reservado: { rotulo: 'Reservado', classe: 'selo--ambar' },
  Emprestado: { rotulo: 'Emprestado', classe: 'selo--azul' },
  Devolvido: { rotulo: 'Devolvido', classe: 'selo--verde' },
  Cancelado: { rotulo: 'Cancelado', classe: 'selo--cinza' },
};

export function papel(role) {
  return role === 'bibliotecario' ? 'Bibliotecário(a)' : 'Leitor(a)';
}

export function plural(n, singular, pluralTexto) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}
