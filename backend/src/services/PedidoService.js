import prisma from '../config/prisma.js';

// ====================================
// CONSTANTES
// ====================================

const FLUXO_STATUS = {
  AGENDADO: ['EM_ATENDIMENTO', 'CANCELADO'],
  EM_ATENDIMENTO: ['FINALIZADO', 'CANCELADO'],
  FINALIZADO: [],
  CANCELADO: [],
};

// ====================================
// VALIDAÇÕES REUTILIZÁVEIS
// ====================================

/**
 * Valida se existe conflito de horário com pedidos existentes
 * @param {Date} horaInicio
 * @param {Date} horaFimComPreparacao
 * @param {string} servicoId - para validações futuras de serviço específico
 * @param {string} pedidoIdExcluir - ID do pedido a excluir da validação (para updates)
 * @returns {Promise<boolean>} true se há conflito
 */
async function existeConflitoDHorario(horaInicio, horaFimComPreparacao, servicoId, pedidoIdExcluir = null) {
  try {
    const conflito = await prisma.pedido.findFirst({
      where: {
        AND: [
          { status: { not: 'CANCELADO' } },
          {
            OR: [
              {
                // Novo começa antes do fim do existente
                AND: [
                  { horaInicio: { lte: horaInicio } },
                  { horaFimComPreparacao: { gt: horaInicio } },
                ],
              },
              {
                // Novo termina depois do começo do existente
                AND: [
                  { horaInicio: { lt: horaFimComPreparacao } },
                  { horaFimComPreparacao: { gte: horaFimComPreparacao } },
                ],
              },
              {
                // Novo engloba o existente
                AND: [
                  { horaInicio: { gte: horaInicio } },
                  { horaFimComPreparacao: { lte: horaFimComPreparacao } },
                ],
              },
            ],
          },
          ...(pedidoIdExcluir ? [{ id: { not: pedidoIdExcluir } }] : []),
        ],
      },
      select: { id: true },
    });

    return !!conflito;
  } catch (erro) {
    throw new Error(`Erro ao validar horário: ${erro.message}`);
  }
}

/**
 * Valida se a transição de status é permitida
 * @param {string} statusAtual
 * @param {string} novoStatus
 * @returns {boolean}
 */
function isTransicaoStatusValida(statusAtual, novoStatus) {
  if (statusAtual === novoStatus) return false;
  return FLUXO_STATUS[statusAtual]?.includes(novoStatus) ?? false;
}

/**
 * Calcula os horários finais baseado na duração e preparação
 * @param {Date} horaInicio
 * @param {number} duracaoMinutos
 * @param {number} tempoPreparacaoMinutos
 * @returns {Object} { horaFim, horaFimComPreparacao }
 */
function calcularHorarios(horaInicio, duracaoMinutos, tempoPreparacaoMinutos) {
  const horaFim = new Date(horaInicio.getTime() + duracaoMinutos * 60000);
  const horaFimComPreparacao = new Date(horaFim.getTime() + tempoPreparacaoMinutos * 60000);

  return { horaFim, horaFimComPreparacao };
}

/**
 * Valida os dados básicos para criar um pedido
 * @param {Object} dados - { data, hora, servicoId }
 * @returns {Object} dados validados { horaInicio, servicoId }
 */
function validarDadosCriacao(dados) {
  const { data, hora, servicoId } = dados;

  if (!data || !hora || !servicoId) {
    throw new Error('data, hora e servicoId são obrigatórios');
  }

  // Validar data (formato: YYYY-MM-DD)
  const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dataRegex.test(data)) {
    throw new Error('data deve estar no formato YYYY-MM-DD');
  }

  // Validar hora (formato: HH:MM)
  const horaRegex = /^\d{2}:\d{2}$/;
  if (!horaRegex.test(hora)) {
    throw new Error('hora deve estar no formato HH:MM');
  }

  // Combinar data e hora em um DateTime
  const [dia, mes, ano] = data.split('-');
  const [horas, minutos] = hora.split(':');
  
  const horaInicio = new Date(`${data}T${hora}:00Z`);
  
  if (isNaN(horaInicio.getTime())) {
    throw new Error('Data e hora inválidas');
  }

  // Validar se não é passado
  const agora = new Date();
  if (horaInicio < agora) {
    throw new Error('Não é possível agendar para uma data/hora no passado');
  }

  return { horaInicio, servicoId };
}

// ====================================
// FUNÇÕES PÚBLICAS
// ====================================

/**
 * Cria um novo pedido com validações completas
 * @param {Object} dados - { data (YYYY-MM-DD), hora (HH:MM), servicoId, descricao? }
 * @param {string} usuarioId
 * @returns {Promise<Object>} pedido criado
 */
export async function criarPedido(dados, usuarioId) {
  // 1. Validar dados básicos
  const { horaInicio, servicoId } = validarDadosCriacao(dados);

  // 2. Buscar serviço
  const servico = await prisma.servico.findUnique({
    where: { id: servicoId },
  });

  if (!servico) {
    throw new Error('Serviço não encontrado');
  }

  // 3. Validar serviço ativo
  if (!servico.ativo) {
    throw new Error('Serviço não está disponível');
  }

  // 4. Calcular horários (com tempo de preparação do serviço)
  const { horaFim, horaFimComPreparacao } = calcularHorarios(
    horaInicio,
    servico.duracaoMinutos,
    servico.tempoPreparacaoMinutos,
  );

  // 5. Validar conflito de horário
  const temConflito = await existeConflitoDHorario(horaInicio, horaFimComPreparacao, servicoId);
  if (temConflito) {
    throw new Error('Horário indisponível - existe outro agendamento neste período');
  }

  // 6. Criar pedido com histórico em transação
  const pedido = await prisma.$transaction(async (tx) => {
    // Extrair apenas a data (sem hora) de horaInicio
    const data = new Date(horaInicio);
    data.setHours(0, 0, 0, 0);

    const novoPedido = await tx.pedido.create({
      data: {
        data,
        horaInicio,
        horaFim,
        horaFimComPreparacao,
        status: 'AGENDADO',
        valorBaseNoMomento: servico.valorBase,
        descricao: dados.descricao,
        usuarioId,
        servicoId,
      },
    });

    // 7. Criar histórico inicial
    await tx.historicoStatus.create({
      data: {
        pedidoId: novoPedido.id,
        statusAntes: 'AGENDADO', // Inicial
        statusDepois: 'AGENDADO',
        usuarioId,
      },
    });

    return novoPedido;
  });

  return pedido;
}

/**
 * Atualiza o status de um pedido com validações rigorosas
 * @param {string} pedidoId
 * @param {string} novoStatus
 * @param {Object} usuario - { id, role }
 * @param {number} valorFinal - opcional, obrigatório se novoStatus === FINALIZADO
 * @returns {Promise<Object>} pedido atualizado
 */
export async function atualizarStatus(pedidoId, novoStatus, usuario, valorFinal = null) {
  // 1. Buscar pedido atual
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
  });

  if (!pedido) {
    throw new Error('Pedido não encontrado');
  }

  // 2. Validar se pedido está finalizado ou cancelado
  if (pedido.status === 'FINALIZADO') {
    throw new Error('Não é possível alterar um pedido finalizado');
  }

  if (pedido.status === 'CANCELADO') {
    throw new Error('Não é possível alterar um pedido cancelado');
  }

  // 3. Validar transição de status
  if (!isTransicaoStatusValida(pedido.status, novoStatus)) {
    throw new Error(`Transição de ${pedido.status} para ${novoStatus} não permitida`);
  }

  // 4. Validações específicas por status
  const atualizacoes = {};

  if (novoStatus === 'EM_ATENDIMENTO') {
    atualizacoes.iniciadoEm = new Date();
  }

  if (novoStatus === 'FINALIZADO') {
    if (!valorFinal) {
      throw new Error('Valor final é obrigatório para finalizar pedido');
    }
    atualizacoes.finalizadoEm = new Date();
    atualizacoes.valorFinal = parseFloat(valorFinal);
  }

  // 5. Atualizar pedido e histórico em transação
  const pedidoAtualizado = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.pedido.update({
      where: { id: pedidoId },
      data: {
        status: novoStatus,
        ...atualizacoes,
      },
    });

    // 6. Registrar histórico
    await tx.historicoStatus.create({
      data: {
        pedidoId,
        statusAntes: pedido.status,
        statusDepois: novoStatus,
        usuarioId: usuario.id,
      },
    });

    return atualizado;
  });

  return pedidoAtualizado;
}

/**
 * Cancela um pedido preservando dados
 * @param {string} pedidoId
 * @param {Object} usuario - { id, role }
 * @returns {Promise<Object>} pedido cancelado
 */
export async function cancelarPedido(pedidoId, usuario) {
  // 1. Buscar pedido
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
  });

  if (!pedido) {
    throw new Error('Pedido não encontrado');
  }

  // 2. Validar se já está cancelado ou finalizado
  if (pedido.status === 'CANCELADO') {
    throw new Error('Pedido já foi cancelado');
  }

  if (pedido.status === 'FINALIZADO') {
    throw new Error('Não é possível alterar um pedido finalizado');
  }

  // 3. Cancelar e registrar histórico
  const pedidoCancelado = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.pedido.update({
      where: { id: pedidoId },
      data: {
        status: 'CANCELADO',
        canceladoEm: new Date(),
        canceladoPorRole: usuario.role,
      },
    });

    // 4. Registrar histórico
    await tx.historicoStatus.create({
      data: {
        pedidoId,
        statusAntes: pedido.status,
        statusDepois: 'CANCELADO',
        usuarioId: usuario.id,
      },
    });

    return atualizado;
  });

  return pedidoCancelado;
}

/**
 * Lista pedidos do usuário autenticado
 * @param {string} usuarioId
 * @returns {Promise<Array>} pedidos do usuário
 */
export async function listarPedidosDoUsuario(usuarioId) {
  if (!usuarioId) {
    throw new Error('usuarioId é obrigatório');
  }

  const pedidos = await prisma.pedido.findMany({
    where: {
      usuarioId,
    },
    include: {
      servico: {
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
        },
      },
    },
    orderBy: {
      horaInicio: 'desc',
    },
  });

  return pedidos;
}

/**
 * Lista todos os pedidos com filtros opcionais (admin)
 * @param {Object} filtros - { status?, dataInicio?, dataFim? }
 * @returns {Promise<Array>} pedidos filtrados
 */
export async function listarPedidosAdmin(filtros = {}) {
  const where = {};

  // Filtro por status
  if (filtros.status) {
    where.status = filtros.status;
  }

  // Filtro por data
  if (filtros.dataInicio || filtros.dataFim) {
    where.horaInicio = {};
    if (filtros.dataInicio) {
      where.horaInicio.gte = new Date(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      where.horaInicio.lte = new Date(filtros.dataFim);
    }
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
        },
      },
      servico: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: [{ horaInicio: 'desc' }],
  });

  return pedidos;
}

/**
 * Busca pedidos por nome do cliente ou telefone
 * @param {string} termo
 * @returns {Promise<Array>} pedidos encontrados
 */
export async function buscarPedidos(termo) {
  if (!termo || termo.trim().length === 0) {
    return [];
  }

  const termoLower = termo.toLowerCase().trim();

  const pedidos = await prisma.pedido.findMany({
    where: {
      OR: [
        {
          usuario: {
            nome: {
              contains: termoLower,
              mode: 'insensitive',
            },
          },
        },
        {
          usuario: {
            telefone: {
              contains: termo,
            },
          },
        },
      ],
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
        },
      },
      servico: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: {
      horaInicio: 'desc',
    },
  });

  return pedidos;
}

/**
 * Calcula indicadores do negócio
 * @returns {Promise<Object>} { totalPedidos, pedidosFinalizados, pedidosAbertos, faturamentoTotal, ticketMedio }
 */
export async function calcularIndicadores() {
  // Buscar todos os pedidos finalizados para somar valor
  const pedidosFinalizados = await prisma.pedido.findMany({
    where: {
      status: 'FINALIZADO',
    },
    select: {
      valorFinal: true,
    },
  });

  const totalPedidos = await prisma.pedido.count();
  const pedidosFinalizadosCount = await prisma.pedido.count({
    where: { status: 'FINALIZADO' },
  });
  const pedidosAbertos = await prisma.pedido.count({
    where: {
      status: {
        in: ['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO'],
      },
    },
  });

  const faturamentoTotal = pedidosFinalizados.reduce(
    (acc, pedido) => acc + (pedido.valorFinal || 0),
    0,
  );

  const ticketMedio = pedidosFinalizadosCount > 0 ? faturamentoTotal / pedidosFinalizadosCount : 0;

  return {
    totalPedidos,
    pedidosFinalizados: pedidosFinalizadosCount,
    pedidosAbertos,
    faturamentoTotal: Number(faturamentoTotal.toFixed(2)),
    ticketMedio: Number(ticketMedio.toFixed(2)),
  };
}

/**
 * Verifica se um pedido está atrasado
 * @param {Object} pedido - pedido com campos horaFim e status
 * @returns {boolean} true se está atrasado
 */
export function verificarAtraso(pedido) {
  if (!pedido || pedido.status === 'FINALIZADO' || pedido.status === 'CANCELADO') {
    return false;
  }

  const agora = new Date();
  return agora > pedido.horaFim;
}


