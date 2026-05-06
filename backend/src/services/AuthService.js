import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { emailValido, senhaValida, normalizar } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ===================================
// 1. CADASTRAR USUÁRIO
// ===================================

export async function cadastrarUsuario(dados) {
  const { nome, email, senha, telefone, role = 'CLIENTE' } = dados;

  // Validar campos obrigatórios
  if (!nome || nome.trim().length === 0) {
    throw new Error('Nome é obrigatório');
  }

  if (!email || email.trim().length === 0) {
    throw new Error('Email é obrigatório');
  }

  if (!emailValido(email)) {
    throw new Error('Email inválido');
  }

  if (!senhaValida(senha)) {
    throw new Error('Senha deve ter no mínimo 6 caracteres');
  }

  const emailNormalizado = normalizar(email);

  // Verificar se email já existe
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email: emailNormalizado },
  });

  if (usuarioExistente) {
    throw new Error('Email já cadastrado');
  }

  // Criptografar senha
  const senhaHash = await bcrypt.hash(senha, 10);

  // Criar usuário
  const usuario = await prisma.usuario.create({
    data: {
      nome: nome.trim(),
      email: emailNormalizado,
      senha: senhaHash,
      telefone: telefone?.trim() || null,
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
}

// ===================================
// 2. LOGIN
// ===================================

export async function login(email, senha, res) {
  if (!email || email.trim().length === 0) {
    throw new Error('Email é obrigatório');
  }

  if (!senhaValida(senha)) {
    throw new Error('Senha é obrigatória');
  }

  const emailNormalizado = normalizar(email);

  // Buscar usuário
  const usuario = await prisma.usuario.findUnique({
    where: { email: emailNormalizado },
  });

  // Erro genérico por segurança
  if (!usuario) {
    throw new Error('Email ou senha inválidos');
  }

  // Validar senha
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

  if (!senhaCorreta) {
    throw new Error('Email ou senha inválidos');
  }

  // Gerar tokens
  const accessToken = jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email,
      role: usuario.role 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: usuario.id },
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
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000, // 15 minutos
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
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
}

// ===================================
// 3. REFRESH TOKEN
// ===================================

export async function refreshToken(refreshTokenString, res) {
  if (!refreshTokenString) {
    throw new Error('Token de renovação não fornecido');
  }

  // Validar JWT
  let payload;
  try {
    payload = jwt.verify(refreshTokenString, JWT_SECRET);
  } catch (erro) {
    throw new Error('Token expirado ou inválido');
  }

  // Verificar no banco
  const tokenNoBanco = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenString },
  });

  if (!tokenNoBanco) {
    throw new Error('Token inválido ou revogado');
  }

  // Buscar usuário
  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.id },
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  // Gerar novo accessToken
  const novoAccessToken = jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email,
      role: usuario.role 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Atualizar cookie
  res.cookie('accessToken', novoAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutos
  });

  return {
    accessToken: novoAccessToken,
  };
}

// ===================================
// 4. LOGOUT
// ===================================

export async function logout(refreshTokenString, res) {
  // Deletar refresh token do banco se fornecido
  if (refreshTokenString) {
    await prisma.refreshToken.delete({
      where: { token: refreshTokenString },
    }).catch(() => {
      // Ignorar erro se token não existir
    });
  }

  // Limpar cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

// ===================================
// 5. VALIDAR TOKEN
// ===================================

export function validarToken(token) {
  if (!token) {
    throw new Error('Token não fornecido');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (erro) {
    if (erro.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    throw new Error('Token inválido');
  }
}
