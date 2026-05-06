import prisma from '../src/config/prisma.js';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Buscar o primeiro serviço criado
  const servico = await prisma.servico.findFirst({
    where: { ativo: true }
  });

  if (!servico) {
    console.log('❌ Nenhum serviço ativo encontrado. Crie um serviço primeiro!');
    return;
  }

  console.log(`✅ Serviço encontrado: ${servico.nome}`);

  // Criar janela de disponibilidade para hoje
  const hoje = new Date();
  const dataFormatada = hoje.toISOString().split('T')[0];

  const janelaExistente = await prisma.disponibilidadeJanela.findFirst({
    where: {
      data: {
        equals: new Date(dataFormatada),
      }
    }
  });

  if (janelaExistente) {
    console.log('✅ Janela para hoje já existe!');
  } else {
    const janela = await prisma.disponibilidadeJanela.create({
      data: {
        data: new Date(dataFormatada),
        horaInicio: new Date(`${dataFormatada}T09:00:00`),
        horaFim: new Date(`${dataFormatada}T18:00:00`),
        ativo: true,
      }
    });

    console.log(`✅ Janela criada: ${dataFormatada} | 09:00 - 18:00`);

    // Criar relação entre serviço e janela
    await prisma.disponibilidadeServicoJanela.create({
      data: {
        servicoId: servico.id,
        janelaId: janela.id,
      }
    });

    // Criar horários disponíveis a cada 30 minutos
    const horarios = [];
    for (let hora = 9; hora < 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaInicio = new Date(`${dataFormatada}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`);
        const horaFim = new Date(horaInicio.getTime() + servico.duracaoMinutos * 60000);

        horarios.push({
          janelaId: janela.id,
          servicoId: servico.id,
          horaInicio,
          horaFim,
          disponivel: true,
          pedidoId: null,
        });
      }
    }

    await prisma.horarioDisponivel.createMany({
      data: horarios,
      skipDuplicates: true,
    });

    console.log(`✅ ${horarios.length} horários criados!`);
  }

  console.log('✨ Seed completado!');
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
