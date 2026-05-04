import { AppError } from '../utils/AppError.js';

/**
 * Middleware global de erros.
 * Registrar por último no app.js, após todas as rotas:
 *
 *   import { erroHandler } from './middleware/erroHandler.js';
 *   app.use(erroHandler);
 */
export function erroHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // ─── Erros da aplicação (AppError) ────────────────────────────────────────
  if (err instanceof AppError) {
    const response = {
      status: 'erro',
      mensagem: err.message,
    };

    if (isDev) {
      response.stack = err.stack;
    }

    return res.status(err.statusCode).json(response);
  }

  // ─── Erros do Prisma ─────────────────────────────────────────────────────
  if (err.code) {
    switch (err.code) {
      // Violação de unique constraint (ex: email já cadastrado)
      case 'P2002': {
        const campo = err.meta?.target?.[0] ?? 'campo';
        return res.status(409).json({
          status: 'erro',
          mensagem: `${campo} já está em uso`,
        });
      }
      // Registro não encontrado
      case 'P2025':
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Registro não encontrado',
        });
      // Violação de foreign key
      case 'P2003':
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Referência inválida: registro relacionado não existe',
        });
    }
  }

  // ─── Erros de validação manual com status ─────────────────────────────────
  if (err.status) {
    return res.status(err.status).json({
      status: 'erro',
      mensagem: err.message,
    });
  }

  // ─── Erro genérico — não expõe detalhes internos em produção ──────────────
  console.error('[Erro não tratado]', err);
  
  return res.status(500).json({
    status: 'erro',
    mensagem: isDev
      ? err.message
      : 'Erro interno no servidor',
    ...(isDev && { stack: err.stack }),
  });
}