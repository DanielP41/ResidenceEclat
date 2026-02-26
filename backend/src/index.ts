import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { generalLimiter } from './middleware/ratelimit.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/rooms.routes';
import bookingRoutes from './routes/bookings.routes';
import auditRoutes from './routes/audit.routes';
import statsRoutes from './routes/stats.routes';
import observationsRoutes from './routes/observations.routes';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(generalLimiter);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/observations', observationsRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Endpoint no encontrado' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Error no controlado:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor',
    });
});

// Start Server
const port = env.PORT;
app.listen(port, () => {
    console.log(`🚀 Servidor de Residencia Éclat corriendo en http://localhost:${port}`);
    console.log(`📡 Entorno: ${env.NODE_ENV}`);
});
