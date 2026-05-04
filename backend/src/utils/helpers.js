/**
 * utils/n.js — Utilitários gerais do NailStyle
 */

// ─── Datas e horários ──────────────────────────────────────────────────────

/**
 * Formata uma data para o padrão brasileiro: dd/mm/aaaa
 * @param {Date|string} data
 * @returns {string}
 */
export function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'America/Bahia' });
}

/**
 * Formata hora para hh:mm
 * @param {Date|string} data
 * @returns {string}
 */
export function formatarHora(data) {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bahia',
  });
}

/**
 * Calcula o horário de fim somando duração (em minutos) ao início.
 * @param {Date|string} inicio
 * @param {number} duracaoMinutos
 * @returns {Date}
 */
export function calcularFim(inicio, duracaoMinutos) {
  const fim = new Date(inicio);
  fim.setMinutes(fim.getMinutes() + duracaoMinutos);
  return fim;
}

/**
 * Gera slots de horário entre inicio e fim respeitando a duração do serviço
 * e o intervalo de preparação entre atendimentos.
 *
 * @param {Date|string} inicio - Início da janela
 * @param {Date|string} fim - Fim da janela
 * @param {number} duracaoServico - Duração do serviço em minutos
 * @param {number} intervalo - Tempo de preparação entre atendimentos em minutos
 * @returns {Array<{ inicio: Date, fim: Date }>}
 */
export function gerarSlots(inicio, fim, duracaoServico, intervalo = 0) {
  const slots = [];
  let cursor = new Date(inicio);
  const fimJanela = new Date(fim);
  const passo = duracaoServico + intervalo;

  while (true) {
    const fimSlot = calcularFim(cursor, duracaoServico);
    if (fimSlot > fimJanela) break;
    slots.push({ inicio: new Date(cursor), fim: fimSlot });
    cursor = calcularFim(cursor, passo);
  }

  return slots;
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem.
 * @param {{ inicio: Date, fim: Date }} a
 * @param {{ inicio: Date, fim: Date }} b
 * @returns {boolean}
 */
export function temConflito(a, b) {
  return new Date(a.inicio) < new Date(b.fim) &&
         new Date(a.fim) > new Date(b.inicio);
}

// ─── Validações ────────────────────────────────────────────────────────────

/**
 * Valida formato de e-mail.
 * @param {string} email
 * @returns {boolean}
 */
export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida força mínima de senha (mínimo 6 caracteres).
 * @param {string} senha
 * @returns {boolean}
 */
export function senhaValida(senha) {
  return typeof senha === 'string' && senha.length >= 6;
}

// ─── Strings ───────────────────────────────────────────────────────────────

/**
 * Remove espaços extras e converte para minúsculas.
 * Útil para normalizar e-mails antes de salvar no banco.
 * @param {string} str
 * @returns {string}
 */
export function normalizar(str) {
  return str?.trim().toLowerCase() ?? '';
}

/**
 * Formata nome próprio com iniciais maiúsculas.
 * @param {string} nome
 * @returns {string}
 */
export function formatarNome(nome) {
  return nome
    ?.trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';
}

// ─── Erros ─────────────────────────────────────────────────────────────────

/**
 * Cria um erro com status HTTP para uso nos services.
 * O erroHandler do middleware vai capturar e responder corretamente.
 *
 * Exemplo:
 *   throw criarErro(404, 'Serviço não encontrado');
 *
 * @param {number} status
 * @param {string} mensagem
 * @returns {Error}
 */
export function criarErro(status, mensagem) {
  const err = new Error(mensagem);
  err.status = status;
  return err;
}