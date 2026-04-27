import { prisma } from '../config/prisma.js';

class DisponibilidadeService {
  /**
   * Cria uma janela de disponibilidade e gera automaticamente os horários disponíveis
   * @param {Object} dados
   * @param {string} dados.manicureId - ID da manicure
   * @param {Date} dados.data - Data da janela (apenas a data)
   * @param {string} dados.horaInicio - Hora inicial (formato HH:mm)
   * @param {string} dados.horaFim - Hora final (formato HH:mm)
   * @param {string[]} dados.servicosIds - Array com IDs dos serviços permitidos
   * @returns {Object} Janela criada com horários disponíveis
   */
  async criarJanelaDisponibilidade(dados) {
    const { manicureId, data, horaInicio, horaFim, servicosIds } = dados;

    if (!servicosIds || servicosIds.length === 0) {
      throw new Error('É necessário indicar pelo menos um serviço permitido');
    }

    // Validar horários
    this._validarHorarios(horaInicio, horaFim);

    // Criar a janela
    const janelaDisponivel = await prisma.disponibilidadeJanela.create({
      data: {
        manicureId,
        data: new Date(data),
        horaInicio: new Date(`2000-01-01T${horaInicio}`),
        horaFim: new Date(`2000-01-01T${horaFim}`),
        servicosPermitidos: {
          create: servicosIds.map((servicoId) => ({
            servicoId,
          })),
        },
      },
      include: {
        servicosPermitidos: {
          include: {
            servico: true,
          },
        },
      },
    });

    // Buscar os serviços para calcular os horários
    const servicos = await prisma.servico.findMany({
      where: {
        id: {
          in: servicosIds,
        },
      },
    });

    // Gerar horários disponíveis para cada serviço
    for (const servico of servicos) {
      await this._gerarHorariosDisponiveisParaServico(
        janelaDisponivel.id,
        servico,
        horaInicio,
        horaFim
      );
    }

    // Retornar a janela com os horários já calculados
    return this.obterJanelaComHorarios(janelaDisponivel.id);
  }

  /**
   * Gera os horários disponíveis para um serviço em uma janela
   * @private
   */
  async _gerarHorariosDisponiveisParaServico(
    janelaId,
    servico,
    horaInicio,
    horaFim
  ) {
    const tempoTotalMinutos = servico.duracaoMinutos + servico.tempoPreparacaoMinutos;

    // Converter strings de hora para minutos
    const inicioMinutos = this._converterHoraParaMinutos(horaInicio);
    const fimMinutos = this._converterHoraParaMinutos(horaFim);

    const horariosDisponibles = [];
    let horarioAtualMinutos = inicioMinutos;

    // Gerar slots enquanto couber dentro da janela
    while (horarioAtualMinutos + tempoTotalMinutos <= fimMinutos) {
      const horarioInicioStr = this._converterMinutosParaHora(horarioAtualMinutos);
      const horarioFimMinutos = horarioAtualMinutos + tempoTotalMinutos;
      const horarioFimStr = this._converterMinutosParaHora(horarioFimMinutos);

      horariosDisponibles.push({
        disponibilidadeJanelaId: janelaId,
        servicoId: servico.id,
        horaInicio: new Date(`2000-01-01T${horarioInicioStr}`),
        horaFim: new Date(`2000-01-01T${horarioFimStr}`),
      });

      // Avançar para o próximo slot (começa quando este termina)
      horarioAtualMinutos = horarioFimMinutos;
    }

    // Inserir todos os horários em uma única operação
    if (horariosDisponibles.length > 0) {
      await prisma.horarioDisponivel.createMany({
        data: horariosDisponibles,
      });
    }
  }

  /**
   * Obtém uma janela com todos os seus horários disponíveis agrupados por serviço
   */
  async obterJanelaComHorarios(janelaId) {
    const janela = await prisma.disponibilidadeJanela.findUnique({
      where: { id: janelaId },
      include: {
        servicosPermitidos: {
          include: {
            servico: true,
          },
        },
        horariosDisponiveis: {
          include: {
            servico: true,
            pedido: true,
          },
          orderBy: {
            horaInicio: 'asc',
          },
        },
      },
    });

    if (!janela) {
      throw new Error('Janela de disponibilidade não encontrada');
    }

    // Agrupar horários por serviço
    const horariosAgrupados = {};

    janela.horariosDisponiveis.forEach((horario) => {
      if (!horariosAgrupados[horario.servicoId]) {
        horariosAgrupados[horario.servicoId] = [];
      }

      horariosAgrupados[horario.servicoId].push({
        id: horario.id,
        horaInicio: horario.horaInicio,
        horaFim: horario.horaFim,
        reservado: !!horario.pedidoId,
        pedidoId: horario.pedidoId,
      });
    });

    return {
      id: janela.id,
      data: janela.data,
      horaInicio: janela.horaInicio,
      horaFim: janela.horaFim,
      ativo: janela.ativo,
      servicosPermitidos: janela.servicosPermitidos.map((sp) => ({
        id: sp.servicoId,
        nome: sp.servico.nome,
        horariosDisponiveis: horariosAgrupados[sp.servicoId] || [],
      })),
    };
  }

  /**
   * Lista todas as janelas de disponibilidade de uma manicure
   */
  async listarJanelasDisponibilidade(manicureId, filtros = {}) {
    const { data, ativo } = filtros;

    const where = {
      manicureId,
      ...(data && { data: new Date(data) }),
      ...(ativo !== undefined && { ativo }),
    };

    const janelas = await prisma.disponibilidadeJanela.findMany({
      where,
      include: {
        servicosPermitidos: {
          include: {
            servico: true,
          },
        },
      },
      orderBy: {
        data: 'asc',
      },
    });

    return janelas;
  }

  /**
   * Obtém TODOS os horários disponíveis para um serviço
   * Agrupa por data/janela
   * Usado pela cliente para visualizar todas as opções
   */
  async obterTodosHorariosDisponivelsPorServico(servicoId) {
    const horarios = await prisma.horarioDisponivel.findMany({
      where: {
        servicoId,
        janelaDisponivel: {
          ativo: true,
        },
        pedidoId: null, // Apenas horários não reservados
      },
      include: {
        servico: true,
        janelaDisponivel: true,
      },
      orderBy: [
        { janelaDisponivel: { data: 'asc' } },
        { horaInicio: 'asc' },
      ],
    });

    // Agrupar por data/janela
    const agrupadoPorJanela = {};

    horarios.forEach((h) => {
      const janelaId = h.janelaDisponivel.id;
      
      if (!agrupadoPorJanela[janelaId]) {
        agrupadoPorJanela[janelaId] = {
          janelaId: h.janelaDisponivel.id,
          data: h.janelaDisponivel.data,
          horaInicioJanela: h.janelaDisponivel.horaInicio,
          horaFimJanela: h.janelaDisponivel.horaFim,
          horarios: [],
        };
      }

      agrupadoPorJanela[janelaId].horarios.push({
        id: h.id,
        horaInicio: h.horaInicio,
        horaFim: h.horaFim,
      });
    });

    return Object.values(agrupadoPorJanela);
  }

  /**
   * Obtém horários disponíveis para um serviço em uma data específica
   * Usado pela cliente para escolher um horário
   */
  async obterHorariosDisponivelsPorServico(servicoId, data) {
    const horarios = await prisma.horarioDisponivel.findMany({
      where: {
        servicoId,
        janelaDisponivel: {
          data: new Date(data),
          ativo: true,
        },
        pedidoId: null, // Apenas horários não reservados
      },
      include: {
        servico: true,
        janelaDisponivel: true,
      },
      orderBy: {
        horaInicio: 'asc',
      },
    });

    return horarios.map((h) => ({
      id: h.id,
      horaInicio: h.horaInicio,
      horaFim: h.horaFim,
      servico: {
        id: h.servico.id,
        nome: h.servico.nome,
        duracao: h.servico.duracaoMinutos,
        preparacao: h.servico.tempoPreparacaoMinutos,
      },
    }));
  }

  /**
   * Reserva um horário disponível
   * Cria um pedido vinculado ao horário
   */
  async reservarHorario(horariosDisponivelId, usuarioId, servicoId) {
    // Buscar o horário disponível
    const horarioDisponivel = await prisma.horarioDisponivel.findUnique({
      where: { id: horariosDisponivelId },
      include: {
        servico: true,
        janelaDisponivel: true,
      },
    });

    if (!horarioDisponivel) {
      throw new Error('Horário não encontrado');
    }

    if (horarioDisponivel.pedidoId) {
      throw new Error('Este horário já foi reservado');
    }

    // Criar o pedido
    const pedido = await prisma.pedido.create({
      data: {
        usuarioId,
        servicoId,
        data: horarioDisponivel.janelaDisponivel.data,
        horaInicio: horarioDisponivel.horaInicio,
        horaFim: horarioDisponivel.horaFim,
        horaFimComPreparacao: new Date(
          horarioDisponivel.horaFim.getTime() +
            horarioDisponivel.servico.tempoPreparacaoMinutos * 60000
        ),
        valorBaseNoMomento: horarioDisponivel.servico.valorBase,
        status: 'AGENDADO',
      },
      include: {
        usuario: true,
        servico: true,
      },
    });

    // Atualizar o horário disponível para marcar como reservado
    await prisma.horarioDisponivel.update({
      where: { id: horariosDisponivelId },
      data: {
        pedidoId: pedido.id,
      },
    });

    return pedido;
  }

  /**
   * Cancela uma reserva e libera o horário
   */
  async cancelarReserva(pedidoId) {
    // Buscar o pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (pedido.status !== 'AGENDADO') {
      throw new Error('Apenas pedidos agendados podem ser cancelados');
    }

    // Atualizar o status do pedido
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        status: 'CANCELADO',
        canceladoEm: new Date(),
      },
    });

    // Liberar o horário
    await prisma.horarioDisponivel.updateMany({
      where: { pedidoId },
      data: {
        pedidoId: null,
      },
    });

    return pedidoAtualizado;
  }

  /**
   * Atualiza uma janela de disponibilidade
   */
  async atualizarJanela(janelaId, dados) {
    const { ativo, servicosIds } = dados;

    const atualizacoes = {};

    if (ativo !== undefined) {
      atualizacoes.ativo = ativo;
    }

    const janelaAtualizada = await prisma.disponibilidadeJanela.update({
      where: { id: janelaId },
      data: atualizacoes,
      include: {
        servicosPermitidos: {
          include: {
            servico: true,
          },
        },
      },
    });

    // Se precisar atualizar os serviços
    if (servicosIds && servicosIds.length > 0) {
      // Remover os serviços antigos
      await prisma.disponibilidadeServicoJanela.deleteMany({
        where: {
          disponibilidadeJanelaId: janelaId,
        },
      });

      // Adicionar os novos serviços
      await prisma.disponibilidadeServicoJanela.createMany({
        data: servicosIds.map((servicoId) => ({
          disponibilidadeJanelaId: janelaId,
          servicoId,
        })),
      });
    }

    return this.obterJanelaComHorarios(janelaId);
  }

  /**
   * Deleta uma janela de disponibilidade
   * Só pode deletar se não houver reservas
   */
  async deletarJanela(janelaId) {
    // Verificar se há horários reservados
    const horariosReservados = await prisma.horarioDisponivel.count({
      where: {
        disponibilidadeJanelaId: janelaId,
        pedidoId: {
          not: null,
        },
      },
    });

    if (horariosReservados > 0) {
      throw new Error(
        'Não é possível deletar uma janela com horários já reservados'
      );
    }

    // Deletar a janela (cascata vai remover horários e relacionamentos)
    return await prisma.disponibilidadeJanela.delete({
      where: { id: janelaId },
    });
  }

  // ===== UTILITÁRIOS PRIVADOS =====

  /**
   * Valida se os horários são válidos
   * @private
   */
  _validarHorarios(horaInicio, horaFim) {
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

    if (!regex.test(horaInicio) || !regex.test(horaFim)) {
      throw new Error('Formato de hora inválido. Use HH:mm');
    }

    const inicioMinutos = this._converterHoraParaMinutos(horaInicio);
    const fimMinutos = this._converterHoraParaMinutos(horaFim);

    if (inicioMinutos >= fimMinutos) {
      throw new Error('A hora de início deve ser menor que a hora de fim');
    }
  }

  /**
   * Converte hora (HH:mm) para minutos
   * @private
   */
  _converterHoraParaMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  /**
   * Converte minutos para hora (HH:mm)
   * @private
   */
  _converterMinutosParaHora(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
}

export default new DisponibilidadeService();
