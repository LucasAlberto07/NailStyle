# Product Requirements Document (PRD) - NailStyle

## Descrição do Usuário e do Negócio

### Usuários
- **Clientes**: Indivíduos que buscam serviços de manicure e desejam agendar online de forma prática e rápida, sem necessidade de ligações telefônicas ou visitas presenciais.
- **Administradores/Manicures**: Profissionais autônomos ou donos de salões que precisam gerenciar eficientemente seus serviços, horários de trabalho e pedidos de clientes.

### Negócio
O NailStyle é uma plataforma SaaS para salões de manicure, focada em otimizar o processo de agendamento e gestão operacional. O negócio visa reduzir o tempo gasto em coordenação manual de horários e aumentar a satisfação do cliente através de uma experiência digital fluida.

## Problema Central

O problema central é a gestão ineficiente de agendamentos em salões de manicure, que atualmente depende de métodos manuais como ligações telefônicas, anotações em agendas físicas ou planilhas, resultando em:

- **Conflitos de horário**: Clientes chegam ao salão e descobrem que o horário está ocupado ou o profissional não está disponível.
- **Perda de receita**: Horários vagos não são preenchidos devido à falta de visibilidade em tempo real.
- **Sobrecarga administrativa**: Manicures passam horas por dia coordenando agendamentos, em vez de focar no atendimento.
- **Insatisfação do cliente**: Esperas longas, cancelamentos de última hora e dificuldade em reagendar.

## Descrição da Solução

O NailStyle é uma plataforma web que permite aos clientes agendar serviços de manicure online através de um calendário interativo, enquanto fornece aos administradores ferramentas completas para gerenciar serviços, disponibilidade e pedidos. A solução integra frontend responsivo com backend robusto, utilizando autenticação segura e banco de dados relacional para garantir confiabilidade e performance.

## O que Está Fora do Escopo

- **Processamento de pagamentos**: Não inclui integração com gateways de pagamento, cobrança automática ou gestão financeira. Justificativa: Foco no agendamento, não em monetização direta.
- **Sistema de inventário**: Não gerencia estoque de produtos, suprimentos ou materiais de manicure. Justificativa: Salões podem usar sistemas separados para isso.
- **Notificações push/SMS**: Não envia lembretes automáticos por SMS ou push notifications. Justificativa: Requer integrações de terceiros complexas e custos adicionais.
- **Multi-tenant para redes de salões**: Não suporta gerenciamento de múltiplos salões ou filiais. Justificativa: MVP focado em salões individuais.
- **Integração com redes sociais**: Não conecta com Instagram, Facebook ou outras plataformas. Justificativa: Não essencial para o core do agendamento.

## Funcionalidades Essenciais

### Autenticação e Autorização
Sistema de login/registro com JWT e roles (cliente/admin). **Justificativa**: Não pode ser removida pois garante segurança e diferenciação de acesso entre usuários comuns e administradores.

### Gerenciamento de Serviços (CRUD)
Admin pode criar, editar, excluir e listar serviços com nome, descrição, preço, duração e tempo de preparação. **Justificativa**: Não pode ser removida pois é o core do negócio - sem serviços, não há agendamentos.

### Sistema de Disponibilidade
Admin define janelas de trabalho e o sistema calcula automaticamente horários disponíveis por serviço. **Justificativa**: Não pode ser removida pois resolve o problema central de conflitos de horário.

### Agendamento de Serviços
Cliente seleciona serviço, data e horário disponível através de interface intuitiva. **Justificativa**: Não pode ser removida pois é a funcionalidade principal que os clientes usam.

### Gerenciamento de Pedidos
Visualização de pedidos com status (agendado, em atendimento, finalizado, cancelado) e histórico. **Justificativa**: Não pode ser removida pois permite rastreamento completo do ciclo de vida dos agendamentos.

### Painel Administrativo
Interface dedicada para admins com acesso a todas as funcionalidades de gestão. **Justificativa**: Não pode ser removida pois diferencia admins de clientes comuns.

## Funcionalidades Secundárias (Nice to Have)

- Relatórios e métricas (número de agendamentos por período, receita estimada)
- Notificações por email para confirmações e lembretes
- Sistema de avaliações e comentários dos clientes
- Integração com calendários externos (Google Calendar)
- Modo offline para visualização de agendamentos
- Personalização de temas e branding do salão
- API para integrações de terceiros (aplicativos móveis)

## Divisão da Squad

### Back-end
- **Lucas**: Middleware de autenticação (JWT), tratamento de erros global e funções utilitárias (utils)
- **Eduarda**: Routes e controllers de todos os módulos (auth, pedido, serviço, disponibilidade)
- **Rodrigo**: Services de todos os módulos (regras de negócio) e schema do Prisma (modelagem do banco de dados)

### Front-end
- **Cael**: Base do projeto, configuração de bibliotecas, autenticação, consumo de API, store Zustand, proteção de rotas e tela de login
- **Victoria**: Layout, responsividade, tela de agendamentos, formulário, validações e modal de criar/editar agendamento
- **Agda 3**: Quadro Kanban com colunas por status, drag and drop com dnd-kit, sincronização com API, alertas de atraso e indicadores de desempenho

---

**Data de Criação**: 6 de maio de 2026  
**Versão**: 1.1  
**Status**: Em Desenvolvimento