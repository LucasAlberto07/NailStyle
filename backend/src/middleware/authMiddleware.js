import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware de autenticação JWT.
 * Verifica o token no header Authorization ou em cookies.
 * Anexa o usuário decodificado em req.usuario.
 */
export function authMiddleware(req, res, next) {
  try {
    // 1. Extrair token do header Authorization ou cookies
    const token = 
      req.headers.authorization?.replace('Bearer ', '') || 
      req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ 
        erro: 'Token não fornecido. Autenticação obrigatória.' 
      });
    }

    // 2. Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Anexar ao request
    req.usuario = decoded;
    
    next();
  } catch (erro) {
    if (erro.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        erro: 'Token expirado. Faça login novamente.' 
      });
    }
    
    if (erro.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        erro: 'Token inválido.' 
      });
    }

    return res.status(401).json({ 
      erro: 'Erro ao verificar autenticação.' 
    });
  }
}

/**
 * Middleware opcional de autenticação.
 * Verifica token mas não retorna erro se não existir.
 */
export function authMiddlewareOpcional(req, res, next) {
  try {
    const token = 
      req.headers.authorization?.replace('Bearer ', '') || 
      req.cookies.accessToken;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.usuario = decoded;
    }
  } catch (erro) {
    // Ignora erro se token for inválido ou expirado
    // req.usuario permanece undefined
  }

  next();
}
