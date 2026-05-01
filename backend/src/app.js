import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import disponibilidadeRoutes from './routes/disponibilidade.js';
import pedidoRoutes from './routes/pedido.js';
import servicoRoutes from './routes/servico.js';

const app = express();

app.use(express.json());

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Servidor OK');
});

app.use('/auth', authRoutes);
app.use('/disponibilidades', disponibilidadeRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/servicos', servicoRoutes);

export default app;
