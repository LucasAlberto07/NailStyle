import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import disponibilidadeRoutes from './routes/disponibilidade.js';
import pedidoRoutes from './routes/pedido.js';
import servicoRoutes from './routes/servico.js';
import { erroHandler } from './middleware/erroHandler.js';
import { authMiddlewareOpcional } from './middleware/authMiddleware.js';

const app = express();

// CORS - Permitir múltiplas origens
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: function (origin, callback) {
    // Se a requisição não tem origin (como em requisições do servidor), permite
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Por enquanto, deixa passar para debug
      callback(null, true);
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Servidor OK');
});

// Rotas públicas
app.use('/auth', authRoutes);

// Aplicar middleware de autenticação opcional nas demais rotas
// Cada rota específica pode exigir autenticação total se necessário
app.use(authMiddlewareOpcional);

app.use('/disponibilidades', disponibilidadeRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/servicos', servicoRoutes);

// Deve ser o último middleware registrado
app.use(erroHandler);

export default app;