# NailStyle - Backend

Sistema de agendamento de serviços de manicure com autenticação, gerenciamento de serviços e validação automática de conflitos de horário.

---

## Requisitos

- **Node.js** v16 ou superior
- **PostgreSQL** v12 ou superior
- **npm**

---

## Instalação

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd NailStyle/backend
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `backend/`:

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:senha@localhost:5432/nailstyle"

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRY_ACCESS=15m
JWT_EXPIRY_REFRESH=7d
```

**Substitua:**
- `postgres` → seu usuário PostgreSQL
- `senha` → sua senha PostgreSQL
- `nailstyle` → nome do seu banco de dados

### 4. Configurar PostgreSQL

Se ainda não tem PostgreSQL instalado:

1. Baixe em: https://www.postgresql.org/download/windows/
2. Instale com as configurações padrão
3. Crie um banco de dados chamado `nailstyle` no pgAdmin

### 5. Executar Migrations

```bash
npx prisma migrate dev --name init
```

Isso criará todas as tabelas necessárias no banco de dados.

### 6. (Opcional) Visualizar Banco de Dados

```bash
npx prisma studio
```

Abre uma interface visual para gerenciar os dados (acesse http://localhost:5555)

---

## Scripts Disponíveis

```bash
# Iniciar servidor em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor em produção
npm start

# Executar migrations
npx prisma migrate dev

# Resetar banco de dados (CUIDADO!)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio
```

---

## Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma          # Definição do banco de dados
│   └── migrations/            # Histórico de alterações
├── src/
│   ├── app.js                 # Configuração do Express
│   ├── server.js              # Inicialização do servidor
│   ├── config/
│   │   └── prisma.js          # Instância do Prisma Client
│   ├── controllers/           # Lógica dos endpoints
│   ├── services/              # Lógica de negócio
│   │   ├── AuthService.js     # Autenticação e autorização
│   │   ├── ServicoService.js  # Gerenciamento de serviços
│   │   └── PedidoService.js   # Gerenciamento de agendamentos
│   ├── middleware/            # Middlewares do Express
│   ├── routes/                # Definição de rotas
│   └── utils/                 # Funções utilitárias
├── .env                       # Variáveis de ambiente
├── .gitignore                 # Arquivos ignorados no git
├── package.json               # Dependências do projeto
└── README.md                  # Este arquivo
```

---

## Autenticação

O sistema utiliza **JWT (JSON Web Tokens)**:

### Fluxo de Login

1. Usuário fornece email e senha
2. Sistema gera:
   - `accessToken` (15 minutos) → enviado na resposta
   - `refreshToken` (7 dias) → salvo em cookie httpOnly

### Usar em Requisições Autenticadas

Adicione o `accessToken` no header:

```
Authorization: Bearer <seu_token_aqui>
```

### Renovar Token

Quando `accessToken` expirar, use o `refreshToken` para gerar um novo sem fazer login novamente.

---

## Agendamento de Serviços

### Como Funciona

1. **Cliente escolhe**: serviço, data (YYYY-MM-DD) e hora (HH:MM)
2. **Sistema valida**:
   - Data/hora não é no passado
   - Serviço existe e está ativo
   - Não há conflito com outros agendamentos
3. **Agendamento criado** com status `AGENDADO`
4. **Conflito de Horário**: Se outro cliente já agendou naquele período, a solicitação é rejeitada

### Fluxo de Status

```
AGENDADO → EM_ATENDIMENTO → FINALIZADO
   ↓
CANCELADO (a qualquer momento, exceto finalizado)
```

### Período Bloqueado

Quando um agendamento é criado (ex: 14:00 até 15:20), esse período **fica indisponível** para outros clientes. O período é liberado apenas se o agendamento for **cancelado**.

---

## Tratamento de Erros

O sistema retorna mensagens claras:

```json
{
  "erro": "Horário indisponível - existe outro agendamento neste período"
}
```

Comum:
- `Serviço não encontrado`
- `Horário indisponível`
- `Não é possível agendar para uma data no passado`
- `Email já existe`
- Etc.

---

## Banco de Dados

### Tabelas Principais

- **usuarios** - Clientes e administradores
- **servicos** - Catálogo de serviços
- **pedidos** - Agendamentos
- **historico_status** - Log de mudanças de status
- **refresh_tokens** - Tokens de autenticação

---

## Fluxos Principais

### Cadastro e Login

```
Novo Usuário → Cadastrar → Email/Senha → Login → Access/Refresh Tokens
```

### Agendamento

```
Ver Serviços → Escolher Serviço + Data + Hora → Validar Conflito → Criar Agendamento
```

### Gerenciamento de Agendamento

```
AGENDADO → EM_ATENDIMENTO → FINALIZADO (com valor)
         → CANCELADO (a qualquer tempo)
```

---

## Segurança

Senhas criptografadas com bcrypt  
Tokens JWT com expiração  
Refresh tokens em cookie httpOnly  
Validações rigorosas de entrada  
Apenas ADMINs podem gerenciar serviços  
Conflitos de horário detectados automaticamente  

---