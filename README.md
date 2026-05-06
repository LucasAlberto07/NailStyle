# NailStyle - Sistema de Agendamento de Serviços

Um sistema completo de agendamento de serviços de manicure e outros tratamentos de unhas, com painel administrativo para gerenciar serviços, horários de disponibilidade e pedidos.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Características Principais](#características-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Usar](#como-usar)
- [API REST](#api-rest)
- [Banco de Dados](#banco-de-dados)
- [Contribuindo](#contribuindo)

---

## Sobre o Projeto

**NailStyle** é uma solução web moderna para gerenciar agendamentos de serviços de manicure. O sistema permite que clientes agendem serviços através de um calendário intuitivo, enquanto administradores podem gerenciar:

- Serviços oferecidos (nome, descrição, duração, valor)
- Janelas de disponibilidade (períodos em que é possível agendar)
- Horários específicos disponíveis para agendamento
- Histórico de pedidos com status
- Autenticação segura com JWT

---

## Características Principais

### Para Clientes
- Cadastro e login seguro
- Interface responsiva e intuitiva
- Visualização de serviços disponíveis
- Agendamento com seleção de data e hora
- Histórico de pedidos
- Proteção de rotas autenticadas

### Para Administradores
- Painel administrativo completo
- Gerenciamento de pedidos (visualizar e atualizar status)
- Gerenciamento de serviços (criar, editar, deletar)
- Criação de janelas de disponibilidade
- Configuração de tempo de preparação por serviço
- Controle de preços e durações

---

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **bcrypt** - Hash de senhas
- **CORS** - Segurança entre domínios

### Frontend
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipagem segura
- **Vite** - Bundler rápido
- **React Router** - Navegação entre páginas
- **Zustand** - Gerenciamento de estado
- **Tailwind CSS** - Estilos utilitários
- **Axios** - Cliente HTTP

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18+)
- **npm** ou **yarn**
- **PostgreSQL** (v14+)
- **Git**

---

## Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone <seu-repositorio>
cd NailStyle
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Configurar variáveis de ambiente (editar .env)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nailstyle"
JWT_SECRET="sua-chave-secreta"
JWT_REFRESH_SECRET="sua-chave-refresh"
PORT=3001
NODE_ENV="development"
```

### 3. Executar Migrações do Banco

```bash
# Criar tabelas no banco de dados
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate

# Popular banco com dados de teste (opcional)
node prisma/seed-full.js
```

### 4. Iniciar Backend

```bash
npm run dev
```

O backend estará disponível em `http://localhost:3001`

### 5. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env (se necessário)
VITE_API_URL=http://localhost:3001
```

### 6. Iniciar Frontend

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

---

## Estrutura do Projeto

```
NailStyle/
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuração Express
│   │   ├── server.js           # Inicialização do servidor
│   │   ├── config/
│   │   │   └── prisma.js       # Configuração Prisma
│   │   ├── controllers/        # Lógica de requisições HTTP
│   │   │   ├── AuthController.js
│   │   │   ├── ServicoController.js
│   │   │   ├── PedidoController.js
│   │   │   └── DisponibilidadeController.js
│   │   ├── services/           # Lógica de negócio
│   │   │   ├── AuthService.js
│   │   │   ├── ServicoService.js
│   │   │   ├── PedidoService.js
│   │   │   └── DisponibilidadeService.js
│   │   ├── routes/             # Definição de rotas
│   │   │   ├── auth.js
│   │   │   ├── servico.js
│   │   │   ├── pedido.js
│   │   │   └── disponibilidade.js
│   │   ├── middleware/         # Middlewares Express
│   │   │   ├── authMiddleware.js
│   │   │   ├── authorizationMiddleware.js
│   │   │   └── erroHandler.js
│   │   └── utils/
│   │       ├── AppError.js
│   │       └── helpers.js
│   ├── prisma/
│   │   ├── schema.prisma       # Definição do banco de dados
│   │   ├── migrations/         # Histórico de migrações
│   │   └── seed-full.js        # Script para popular banco
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # Entrada da aplicação
│   │   ├── App.tsx             # Componente raiz
│   │   ├── index.css           # Estilos globais
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── Alert.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ServiceCard.tsx
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Agendar.tsx
│   │   │   ├── MeusPedidos.tsx
│   │   │   ├── HistoricoPedido.tsx
│   │   │   └── Admin.tsx
│   │   ├── services/
│   │   │   └── api.ts          # Cliente HTTP
│   │   └── stores/
│   │       └── authStore.ts    # Store Zustand
│   ├── public/
│   └── package.json
│
├── db.json                     # Dados locais (desenvolvimento)
├── TODO.md                     # Tarefas pendentes
└── README.md                   # Este arquivo
```

---

## Como Usar

### Cadastro e Login

1. Acesse `http://localhost:5173`
2. Clique em "Registrar-se"
3. Preencha os dados: nome, email, telefone, senha
4. Faça login com suas credenciais

### Agendar um Serviço (Cliente)

1. Após login, clique em "Agendar"
2. Selecione o serviço desejado
3. Escolha uma data disponível
4. Selecione o horário preferido
5. Clique em "Agendar" para confirmar

### Gerenciar Sistema (Admin)

**Credenciais de teste:**
- Email: `admin@nailstyle.com`
- Senha: `admin123`

No painel administrativo é possível:

#### Pedidos
- Visualizar todos os pedidos
- Atualizar status (Agendado → Em Atendimento → Finalizado)
- Cancelar pedidos se necessário

#### Serviços
- Criar novo serviço com nome, descrição, duração e valor
- Editar serviços existentes
- Deletar serviços
- Ajustar tempo de preparação

#### Janelas de Disponibilidade
- Criar períodos de disponibilidade
- Definir hora inicial e final
- Selecionar quais serviços estão disponíveis
- Deletar janelas quando necessário

---

## API REST

### Autenticação

#### POST `/api/auth/register`
Registrar novo usuário
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "senha": "senha123"
}
```

#### POST `/api/auth/login`
Fazer login

---

#### POST `/api/auth/refresh`
Renovar token JWT

---

### Serviços

#### GET `/api/servicos`
Listar todos os serviços

#### GET `/api/servicos/:id`
Obter detalhes de um serviço

#### POST `/api/servicos` (Admin)
Criar novo serviço
```json
{
  "nome": "Manicure",
  "descricao": "Manicure completa",
  "duracaoMinutos": 60,
  "tempoPreparacaoMinutos": 15,
  "valorBase": 50.00
}
```

#### PUT `/api/servicos/:id` (Admin)
Atualizar serviço

#### DELETE `/api/servicos/:id` (Admin)
Deletar serviço

---

### Pedidos

#### GET `/api/pedidos`
Listar pedidos do usuário logado

#### GET `/api/pedidos/:id`
Obter detalhes do pedido

#### POST `/api/pedidos`
Criar novo pedido
```json
{
  "servicoId": "uuid-servico",
  "data": "2026-05-24",
  "horaInicio": "10:00"
}
```

#### PUT `/api/pedidos/:id` (Admin)
Atualizar status do pedido
```json
{
  "status": "EM_ATENDIMENTO"
}
```

---

### Disponibilidade

#### GET `/api/disponibilidade/janelas`
Listar janelas de disponibilidade

#### GET `/api/disponibilidade/horarios`
Listar horários disponíveis
```
?servicoId=uuid&data=2026-05-24
```

#### POST `/api/disponibilidade/janelas` (Admin)
Criar janela de disponibilidade
```json
{
  "data": "2026-05-24",
  "horaInicio": "09:00",
  "horaFim": "18:00",
  "servicosIds": ["uuid-servico-1", "uuid-servico-2"]
}
```

#### DELETE `/api/disponibilidade/janelas/:id` (Admin)
Deletar janela

---

## Banco de Dados

### Modelos Principais

#### Usuario
```prisma
model Usuario {
  id: String (UUID)
  nome: String
  email: String (único)
  senha: String (hasheada)
  telefone: String?
  role: "ADMIN" | "CLIENTE"
  criadoEm: DateTime
  
  // Relações
  pedidos: Pedido[]
  refreshTokens: RefreshToken[]
}
```

#### Servico
```prisma
model Servico {
  id: String (UUID)
  nome: String (único)
  descricao: String?
  valorBase: Decimal
  duracaoMinutos: Int
  tempoPreparacaoMinutos: Int (padrão: 0)
  ativo: Boolean (padrão: true)
  criadoEm: DateTime
  atualizadoEm: DateTime
}
```

#### Pedido
```prisma
model Pedido {
  id: String (UUID)
  data: DateTime
  horaInicio: DateTime
  horaFim: DateTime
  horaFimComPreparacao: DateTime
  status: "AGENDADO" | "EM_ATENDIMENTO" | "FINALIZADO" | "CANCELADO"
  valorBaseNoMomento: Decimal
  valorFinal: Decimal?
  criadoEm: DateTime
  atualizadoEm: DateTime
  
  // Relações
  usuarioId: String
  servicoId: String
}
```

#### DisponibilidadeJanela
```prisma
model DisponibilidadeJanela {
  id: String (UUID)
  data: DateTime
  horaInicio: String
  horaFim: String
  ativo: Boolean (padrão: true)
  criadoEm: DateTime
}
```

---

## Segurança

- Senhas hasheadas com bcrypt
- Autenticação JWT com tokens de curta duração
- Refresh tokens para sessões prolongadas
- CORS configurado
- Validação de dados de entrada
- Tratamento centralizado de erros
- Proteção de rotas por role (Admin/Cliente)

---

## Status do Projeto

-  Arquitetura backend
-  Autenticação e autorização
-  CRUD de serviços
-  CRUD de pedidos
-  Gerenciamento de disponibilidade
-  Interface frontend responsiva
-  Painel administrativo
-  Validação de dados
-  Tratamento de erros

---

