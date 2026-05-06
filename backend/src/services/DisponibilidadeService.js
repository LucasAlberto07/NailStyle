import prisma from '../config/prisma.js';

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

    // Buscar os serviços para calcular os horários
    const servicos = await prisma.servico.findMany({
      where: {
        id: {
          in: servicosIds,
        },
        ativo: true,
      },
    });

    if (servicos.length !== new Set(servicosIds).size) {
      throw new Error('Um ou mais serviços permitidos não existem ou estão inativos');
    }

    // Criar a janela
    const janelaDisponivel = await prisma.disponibilidadeJanela.create({
      data: {
        manicureId,
        data: new Date(data),
        horaInicio: new Date(`2000-01-01T${horaInicio}:00Z`),
        horaFim: new Date(`2000-01-01T${horaFim}:00Z`),
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

    // Gerar horários disponíveis para cada serviço
    for (const servico of servicos) {
      await this._gerarHorariosDisponiveisParaServico(
        janelaDisponivel.id,
        servico,
        janelaDisponivel.data,
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
    data,
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
        horaInicio: new Date(`2000-01-01T${horarioInicioStr}:00Z`),
        horaFim: new Date(`2000-01-01T${horarioFimStr}:00Z`),
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

    // Formatar data como YYYY-MM-DD
    const dataFormatada = janela.data.toISOString().split('T')[0];
    
    // Formatar horários como HH:MM
    const horaInicioStr = this._formatarHora(janela.horaInicio);
    const horaFimStr = this._formatarHora(janela.horaFim);

    // Agrupar horários por serviço
    const horariosAgrupados = {};

    janela.horariosDisponiveis.forEach((horario) => {
      if (!horariosAgrupados[horario.servicoId]) {
        horariosAgrupados[horario.servicoId] = [];
      }

      const horaInicioHorario = this._formatarHora(horario.horaInicio);
      const horaFimHorario = this._formatarHora(horario.horaFim);

      horariosAgrupados[horario.servicoId].push({
        id: horario.id,
        horaInicio: horaInicioHorario,
        horaFim: horaFimHorario,
        reservado: !!horario.pedidoId,
        pedidoId: horario.pedidoId,
      });
    });

    return {
      id: janela.id,
      data: dataFormatada,
      horaInicio: horaInicioStr,
      horaFim: horaFimStr,
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

    return janelas.map((janela) => {
      const dataFormatada = janela.data.toISOString().split('T')[0];
      const horaInicioStr = this._formatarHora(janela.horaInicio);
      const horaFimStr = this._formatarHora(janela.horaFim);

      return {
        id: janela.id,
        data: dataFormatada,
        horaInicio: horaInicioStr,
        horaFim: horaFimStr,
        ativo: janela.ativo,
        servicosPermitidos: janela.servicosPermitidos.map((sp) => ({
          id: sp.servicoId,
          nome: sp.servico.nome,
        })),
      };
    });
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

    return horarios.map((h) => {
      // Formatar data como YYYY-MM-DD
      const dataJanela = h.janelaDisponivel.data;
      const dataFormatada = dataJanela.toISOString().split('T')[0];
      
      // Formatar horários como HH:MM
      const horaInicioStr = this._formatarHora(h.horaInicio);
      const horaFimStr = this._formatarHora(h.horaFim);
      
      return {
        id: h.id,
        data: dataFormatada,
        horaInicio: horaInicioStr,
        horaFim: horaFimStr,
        disponivel: !h.pedidoId,
        servico: {
          id: h.servico.id,
          nome: h.servico.nome,
          duracao: h.servico.duracaoMinutos,
          preparacao: h.servico.tempoPreparacaoMinutos,
        },
      };
    });
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

    return horarios.map((h) => {
      // Formatar data como YYYY-MM-DD
      const dataJanela = h.janelaDisponivel.data;
      const dataFormatada = dataJanela.toISOString().split('T')[0];
      
      // Formatar horários como HH:MM
      const horaInicioStr = this._formatarHora(h.horaInicio);
      const horaFimStr = this._formatarHora(h.horaFim);
      
      return {
        id: h.id,
        data: dataFormatada,
        horaInicio: horaInicioStr,
        horaFim: horaFimStr,
        servico: {
          id: h.servico.id,
          nome: h.servico.nome,
          duracao: h.servico.duracaoMinutos,
          preparacao: h.servico.tempoPreparacaoMinutos,
        },
      };
    });
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

    if (servicoId && servicoId !== horarioDisponivel.servicoId) {
      throw new Error('O serviço informado não corresponde ao horário escolhido');
    }

    const horaFimAtendimento = new Date(
      horarioDisponivel.horaInicio.getTime() + horarioDisponivel.servico.duracaoMinutos * 60000
    );

    // Criar o pedido
    const pedido = await prisma.pedido.create({
      data: {
        usuarioId,
        servicoId: horarioDisponivel.servicoId,
        data: horarioDisponivel.janelaDisponivel.data,
        horaInicio: horarioDisponivel.horaInicio,
        horaFim: horaFimAtendimento,
        horaFimComPreparacao: horarioDisponivel.horaFim,
        valorBaseNoMomento: horarioDisponivel.servico.valorBase,
        status: 'AGENDADO',
      },
      include: {
        usuario: true,
        servico: true,
      },
    });

    // Atualizar o horário disponível e os horários sobrepostos para marcar como reservado
    await prisma.horarioDisponivel.updateMany({
      where: {
        disponibilidadeJanelaId: horarioDisponivel.disponibilidadeJanelaId,
        pedidoId: null,
        horaInicio: { lt: horarioDisponivel.horaFim },
        horaFim: { gt: horarioDisponivel.horaInicio },
      },
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
    const { ativo, horaInicio, horaFim, servicosIds } = dados;

    const atualizacoes = {};

    if (ativo !== undefined) {
      atualizacoes.ativo = ativo;
    }

    // Validar e processar alteração de horários
    if (horaInicio || horaFim) {
      if (!horaInicio || !horaFim) {
        throw new Error('Deve informar tanto horaInicio quanto horaFim');
      }

      this._validarHorarios(horaInicio, horaFim);

      atualizacoes.horaInicio = new Date(`2000-01-01T${horaInicio}:00Z`);
      atualizacoes.horaFim = new Date(`2000-01-01T${horaFim}:00Z`);
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

    // Se houve alteração de horários, regenerar todos os horários disponíveis
    if (horaInicio || horaFim) {
      // Buscar serviços permitidos
      const servicosPermitidos = await prisma.disponibilidadeServicoJanela.findMany({
        where: { disponibilidadeJanelaId: janelaId },
        include: { servico: true },
      });

      // Verificar se há horários com reservas
      const horariosComReservas = await prisma.horarioDisponivel.count({
        where: {
          disponibilidadeJanelaId: janelaId,
          pedidoId: {
            not: null,
          },
        },
      });

      if (horariosComReservas > 0) {
        throw new Error('Não é possível alterar os horários de uma janela com agendamentos realizados');
      }

      // Deletar horários antigos (que não têm reservas)
      await prisma.horarioDisponivel.deleteMany({
        where: { 
          disponibilidadeJanelaId: janelaId,
          pedidoId: null,
        },
      });

      // Gerar novos horários com os novos tempos
      const novaHoraInicio = horaInicio || this._formatarHora(janelaAtualizada.horaInicio);
      const novaHoraFim = horaFim || this._formatarHora(janelaAtualizada.horaFim);

      for (const sp of servicosPermitidos) {
        await this._gerarHorariosDisponiveisParaServico(
          janelaId,
          sp.servico,
          janelaAtualizada.data,
          novaHoraInicio,
          novaHoraFim
        );
      }
    }

    // Se precisar atualizar os serviços
    if (servicosIds && servicosIds.length > 0) {
      const horariosReservados = await prisma.horarioDisponivel.count({
        where: {
          disponibilidadeJanelaId: janelaId,
          pedidoId: {
            not: null,
          },
        },
      });

      if (horariosReservados > 0) {
        throw new Error('Não é possível alterar serviços de uma janela com horários reservados');
      }

      const servicos = await prisma.servico.findMany({
        where: {
          id: {
            in: servicosIds,
          },
          ativo: true,
        },
      });

      if (servicos.length !== new Set(servicosIds).size) {
        throw new Error('Um ou mais serviços permitidos não existem ou estão inativos');
      }

      // Remover os serviços antigos
      await prisma.disponibilidadeServicoJanela.deleteMany({
        where: {
          disponibilidadeJanelaId: janelaId,
        },
      });

      // Remover horários antigos
      await prisma.horarioDisponivel.deleteMany({
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

      const horaInicio = this._formatarHora(janelaAtualizada.horaInicio);
      const horaFim = this._formatarHora(janelaAtualizada.horaFim);

      // Gerar novos horários
      for (const servico of servicos) {
        await this._gerarHorariosDisponiveisParaServico(
          janelaId,
          servico,
          horaInicio,
          horaFim
        );
      }
    }

    return this.obterJanelaComHorarios(janelaId);
  }

  /**
   * Deleta uma janela de disponibilidade
   * Só pode deletar se não houver reservas
   */
  async deletarJanela(janelaId) {
    // Buscar todos os horários reservados da janela
    const horariosReservados = await prisma.horarioDisponivel.findMany({
      where: {
        disponibilidadeJanelaId: janelaId,
        pedidoId: {
          not: null,
        },
      },
    });

    // Se houver horários reservados, deletar os pedidos relacionados primeiro
    if (horariosReservados.length > 0) {
      const pedidoIds = horariosReservados
        .filter(h => h.pedidoId)
        .map(h => h.pedidoId);

      if (pedidoIds.length > 0) {
        // Deletar todos os pedidos relacionados
        await prisma.pedido.deleteMany({
          where: {
            id: {
              in: pedidoIds,
            },
          },
        });
      }
    }

    // Deletar todos os horários da janela
    await prisma.horarioDisponivel.deleteMany({
      where: {
        disponibilidadeJanelaId: janelaId,
      },
    });

    // Deletar os relacionamentos com serviços
    await prisma.disponibilidadeServicoJanela.deleteMany({
      where: {
        disponibilidadeJanelaId: janelaId,
      },
    });

    // Deletar a janela
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

  _formatarHora(dataHora) {
    return `${String(dataHora.getHours()).padStart(2, '0')}:${String(
      dataHora.getMinutes()
    ).padStart(2, '0')}`;
  }
}

export default new DisponibilidadeService();
