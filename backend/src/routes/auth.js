import { Router } from 'express';
import authController from '../controllers/AuthController.js';

const router = Router();

// POST /auth/register
router.post('/register', authController.registrar.bind(authController));

// POST /auth/login
router.post('/login', authController.entrar.bind(authController));

// POST /auth/refresh
router.post('/refresh', authController.renovar.bind(authController));

// POST /auth/logout
router.post('/logout', authController.sair.bind(authController));

export default router;
