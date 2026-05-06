import prisma from './src/config/prisma.js';

async function main() {
  try {
    const servicos = await prisma.servico.findMany({
      select: {
        id: true,
        nome: true,
        duracaoMinutos: true,
        tempoPreparacaoMinutos: true,
        valorBase: true,
        ativo: true,
      },
      orderBy: { nome: 'asc' }
    });
    console.log('Serviços atuais:');
    console.table(servicos.map(s => ({
      nome: s.nome,
      duracao: s.duracaoMinutos,
      preparo: s.tempoPreparacaoMinutos,
      valor: `R$ ${s.valorBase}`,
      ativo: s.ativo ? 'Sim' : 'Não'
    })));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
