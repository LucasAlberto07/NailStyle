import prisma from '../config/prisma.js';
import { AppError, ERROS } from '../utils/AppError.js';

// ===================================
// FUNÇÕES AUXILIARES
// ===================================

/**
 * Valida se usuário é ADMIN
 * @param {Object} usuario - { role }
 * @throws {AppError}
 */
function validarAdmin(usuario) {
  if (!usuario || usuario.role !== 'ADMIN') {
    throw ERROS.ROLE_INSUFICIENTE('ADMIN');
  }
}

/**
 * Valida dados do serviço
 * @param {Object} dados - { nome, valorBase, duracaoMinutos, tempoPreparacaoMinutos? }
 * @throws {AppError}
 */
function validarDadosServico(dados) {
  const { nome, valorBase, duracaoMinutos, tempoPreparacaoMinutos } = dados;

  if (!nome || nome.trim().length === 0) {
    throw ERROS.CAMPO_OBRIGATORIO('Nome do serviço');
  }

  if (valorBase === undefined || valorBase === null) {
    throw ERROS.CAMPO_OBRIGATORIO('Valor base');
  }

  if (valorBase < 0) {
    throw ERROS.DADOS_INVALIDOS('Valor base não pode ser negativo');
  }

  if (!duracaoMinutos || duracaoMinutos <= 0) {
    throw ERROS.DADOS_INVALIDOS('Duração deve ser maior que 0 minutos');
  }

  if (tempoPreparacaoMinutos !== undefined && tempoPreparacaoMinutos < 0) {
    throw ERROS.DADOS_INVALIDOS('Tempo de preparação não pode ser negativo');
  }
}

// ===================================
// 1. CRIAR SERVIÇO
// ===================================

export async function criarServico(dados, usuario) {
  // Validar admin
  validarAdmin(usuario);

  // Validar dados
  validarDadosServico(dados);

  const { nome, descricao, categoria, valorBase, duracaoMinutos, tempoPreparacaoMinutos } = dados;

  // Verificar se nome já existe
  const servicoExistente = await prisma.servico.findUnique({
    where: { nome },
  });

  if (servicoExistente) {
    throw ERROS.CAMPO_DUPLICADO('Nome do serviço');
  }

  // Criar serviço
  const servico = await prisma.servico.create({
    data: {
      nome: nome.trim(),
      descricao: descricao?.trim(),
      categoria: categoria?.trim(),
      valorBase: parseFloat(valorBase),
      duracaoMinutos: parseInt(duracaoMinutos),
      tempoPreparacaoMinutos: tempoPreparacaoMinutos ? parseInt(tempoPreparacaoMinutos) : 0,
      ativo: true,
    },
  });

  return servico;
}

// ===================================
// 2. LISTAR SERVIÇOS (CLIENTE)
// ===================================

export async function listarServicos(ativo = true) {
  const servicos = await prisma.servico.findMany({
    where: {
      ativo,
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      categoria: true,
      valorBase: true,
      duracaoMinutos: true,
      tempoPreparacaoMinutos: true,
      ativo: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });

  return servicos;
}

// ===================================
// 3. BUSCAR SERVIÇO POR ID
// ===================================

export async function buscarServicoPorId(id) {
  const servico = await prisma.servico.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      descricao: true,
      categoria: true,
      valorBase: true,
      duracaoMinutos: true,
      tempoPreparacaoMinutos: true,
      ativo: true,
    },
  });

  if (!servico) {
    throw ERROS.NAO_ENCONTRADO('Serviço');
  }

  if (!servico.ativo) {
    throw ERROS.NAO_ENCONTRADO('Serviço (não disponível)');
  }

  return servico;
  }


// ===================================
// 4. ATUALIZAR SERVIÇO
// ===================================

export async function atualizarServico(id, dados, usuario) {
  // Validar admin
  validarAdmin(usuario);

  // Buscar serviço
  const servico = await prisma.servico.findUnique({
    where: { id },
  });

  if (!servico) {
    throw ERROS.NAO_ENCONTRADO('Serviço');
  }

  // Preparar dados para atualizar
  const atualizacoes = {};

  // Validar e atualizar nome
  if (dados.nome !== undefined) {
    if (!dados.nome || dados.nome.trim().length === 0) {
      throw ERROS.CAMPO_OBRIGATORIO('Nome do serviço');
    }

    // Verificar se novo nome já existe (apenas se mudou)
    if (dados.nome !== servico.nome) {
      const nomeExistente = await prisma.servico.findUnique({
        where: { nome: dados.nome },
      });

      if (nomeExistente) {
        throw ERROS.CAMPO_DUPLICADO('Nome do serviço');
      }
    }

    atualizacoes.nome = dados.nome.trim();
  }

  // Validar e atualizar valores
  if (dados.valorBase !== undefined) {
    const valor = parseFloat(dados.valorBase);
    if (valor < 0) {
      throw ERROS.DADOS_INVALIDOS('Valor base não pode ser negativo');
    }
    atualizacoes.valorBase = valor;
  }

  if (dados.duracaoMinutos !== undefined) {
    const duracao = parseInt(dados.duracaoMinutos);
    if (duracao <= 0) {
      throw ERROS.DADOS_INVALIDOS('Duração deve ser maior que 0 minutos');
    }
    atualizacoes.duracaoMinutos = duracao;
  }

  // Validar e atualizar tempo de preparação
  if (dados.tempoPreparacaoMinutos !== undefined) {
    const tempo = parseInt(dados.tempoPreparacaoMinutos);
    if (tempo < 0) {
      throw ERROS.DADOS_INVALIDOS('Tempo de preparação não pode ser negativo');
    }
    atualizacoes.tempoPreparacaoMinutos = tempo;
  }

  // Atualizar status ativo
  if (dados.ativo !== undefined) {
    atualizacoes.ativo = dados.ativo;
  }

  // Atualizar descrição e categoria
  if (dados.descricao !== undefined) {
    atualizacoes.descricao = dados.descricao?.trim();
  }

  if (dados.categoria !== undefined) {
    atualizacoes.categoria = dados.categoria?.trim();
  }

  // Atualizar no banco
  const servicoAtualizado = await prisma.servico.update({
    where: { id },
    data: atualizacoes,
  });

  return servicoAtualizado;
}

// ===================================
// 5. DESATIVAR SERVIÇO
// ===================================

// ===================================
// 5. DESATIVAR SERVIÇO
// ===================================

export async function desativarServico(id, usuario) {
  // Validar admin
  validarAdmin(usuario);

  // Buscar serviço
  const servico = await prisma.servico.findUnique({
    where: { id },
  });

  if (!servico) {
    throw ERROS.NAO_ENCONTRADO('Serviço');
  }

  // Desativar
  const servicoDesativado = await prisma.servico.update({
    where: { id },
    data: {
      ativo: false,
    },
  });

  return servicoDesativado;
}

// ===================================
// 6. LISTAR SERVIÇOS (ADMIN)
// ===================================

export async function listarServicosAdmin(usuario) {
  // Validar admin
  validarAdmin(usuario);

  // Retornar todos (ativos e inativos)
  const servicos = await prisma.servico.findMany({
    orderBy: {
      nome: 'asc',
    },
  });

  return servicos;
}
