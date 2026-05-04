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

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS,
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