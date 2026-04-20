import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ===================================
// 1. CADASTRAR USUÁRIO
// ===================================

export async function cadastrarUsuario(dados) {
  try {
    const { nome, email, senha, telefone, role = 'CLIENTE' } = dados;

    // Validar
    if (!nome) throw new Error('Nome é obrigatório');
    if (!email) throw new Error('Email é obrigatório');
    if (!senha || senha.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres');

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        telefone: telefone || null,
        role,
      },
    });

    // Retornar sem senha
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    };
  } catch (erro) {
    throw new Error(erro.message);
  }
}

// ===================================
// 2. LOGIN
// ===================================

export async function login(email, senha, res) {
  try {
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Erro genérico
    if (!usuario) {
      throw new Error('Email ou senha inválidos');
    }

    // Validar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar tokens
    const accessToken = jwt.sign(
      { userId: usuario.id, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: usuario.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Salvar refresh token no banco
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuarioId: usuario.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Enviar refresh token via cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    // Retornar
    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    };
  } catch (erro) {
    throw new Error(erro.message);
  }
}

// ===================================
// 3. REFRESH TOKEN
// ===================================

export async function refreshToken(refreshTokenString, res) {
  try {
    if (!refreshTokenString) {
      throw new Error('Token não fornecido');
    }

    // Validar JWT
    const payload = jwt.verify(refreshTokenString, JWT_SECRET);

    // Verificar no banco
    const tokenNoBanco = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
    });

    if (!tokenNoBanco) {
      throw new Error('Token inválido');
    }

    // Gerar novo accessToken
    const novoAccessToken = jwt.sign(
      { userId: payload.userId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return {
      accessToken: novoAccessToken,
    };
  } catch (erro) {
    throw new Error(erro.message);
  }
}

// ===================================
// 4. LOGOUT
// ===================================

export async function logout(refreshTokenString, res) {
  try {
    // Deletar refresh token do banco
    if (refreshTokenString) {
      await prisma.refreshToken.delete({
        where: { token: refreshTokenString },
      });
    }

    // Limpar cookie
    res.clearCookie('refreshToken');
  } catch (erro) {
    throw new Error(erro.message);
  }
}

// ===================================
// 5. GERAR ACCESS TOKEN
// ===================================

export function gerarAccessToken(usuario) {
  const token = jwt.sign(
    { userId: usuario.id, role: usuario.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  return token;
}

// ===================================
// 6. GERAR REFRESH TOKEN
// ===================================

export function gerarRefreshToken(usuario) {
  const token = jwt.sign(
    { userId: usuario.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return token;
}

// ===================================
// 7. VALIDAR TOKEN
// ===================================

export function validarToken(token) {
  try {
    if (!token) {
      throw new Error('Token não fornecido');
    }

    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (erro) {
    throw new Error('Token inválido ou expirado');
  }
}

export {
  cadastrarUsuario,
  login,
  refreshToken,
  logout,
  gerarAccessToken,
  gerarRefreshToken,
  validarToken,
};