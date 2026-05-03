/**
 * Middleware de autorização baseado em role.
 * Verifica se o usuário tem a role necessária.
 * 
 * Uso: router.post('/admin', requireRole('ADMIN'), controller.metodo)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        erro: 'Autenticação obrigatória' 
      });
    }

    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ 
        erro: `Acesso negado. Role necessária: ${roles.join(' ou ')}` 
      });
    }

    next();
  };
}

/**
 * Middleware que verifica se é o proprietário do recurso ou admin.
 * Compara req.usuario.id com o parâmetro da rota.
 */
export function requireOwnerOrAdmin(paramName = 'usuarioId') {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        erro: 'Autenticação obrigatória' 
      });
    }

    const resourceOwnerId = req.params[paramName] || req.body[paramName];

    if (req.usuario.id !== resourceOwnerId && req.usuario.role !== 'ADMIN') {
      return res.status(403).json({ 
        erro: 'Você não tem permissão para acessar este recurso' 
      });
    }

    next();
  };
}
