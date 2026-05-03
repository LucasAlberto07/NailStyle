/**
 * Classe de erro operacional para a aplicação.
 * Permite diferenciar erros conhecidos de erros inesperados.
 */
export class AppError extends Error {
  constructor(mensagem, statusCode = 500) {
    super(mensagem);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erros pré-definidos para reutilização
 */
export const ERROS = {
  // Autenticação (401)
  NAO_AUTENTICADO: () => new AppError('Autenticação obrigatória', 401),
  TOKEN_EXPIRADO: () => new AppError('Token expirado. Faça login novamente.', 401),
  TOKEN_INVALIDO: () => new AppError('Token inválido.', 401),

  // Autorização (403)
  NAO_AUTORIZADO: () => new AppError('Você não tem permissão para acessar este recurso', 403),
  ROLE_INSUFICIENTE: (roleNecessaria) => 
    new AppError(`Role necessária: ${roleNecessaria}`, 403),

  // Validação (400)
  DADOS_INVALIDOS: (detalhes) => 
    new AppError(`Dados inválidos: ${detalhes}`, 400),
  CAMPO_OBRIGATORIO: (campo) => 
    new AppError(`${campo} é obrigatório`, 400),
  CAMPO_DUPLICADO: (campo) => 
    new AppError(`${campo} já está em uso`, 400),
  FORMATO_INVALIDO: (campo, formato) => 
    new AppError(`${campo} deve estar em formato ${formato}`, 400),

  // Não encontrado (404)
  NAO_ENCONTRADO: (recurso) => 
    new AppError(`${recurso} não encontrado`, 404),

  // Conflito (409)
  CONFLITO: (detalhes) => 
    new AppError(`Conflito: ${detalhes}`, 409),

  // Erro interno (500)
  ERRO_INTERNO: () => 
    new AppError('Erro interno no servidor', 500),
};

/**
 * Função auxiliar para validar campos obrigatórios
 * @param {Object} dados - Objeto a validar
 * @param {string[]} campos - Lista de campos obrigatórios
 * @throws {AppError}
 */
export function validarCamposObrigatorios(dados, campos) {
  for (const campo of campos) {
    if (dados[campo] === undefined || dados[campo] === null || dados[campo] === '') {
      throw ERROS.CAMPO_OBRIGATORIO(campo);
    }
  }
}

/**
 * Função auxiliar para validar email
 * @param {string} email
 * @returns {boolean}
 */
export function emailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Função auxiliar para validar força mínima de senha
 * @param {string} senha
 * @returns {boolean}
 */
export function senhaValida(senha) {
  return typeof senha === 'string' && senha.length >= 6;
}
