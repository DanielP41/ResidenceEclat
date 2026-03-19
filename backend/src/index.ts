import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { generalLimiter } from './middleware/ratelimit.middleware';
import logger, { httpLogger } from './config/logger';
import { AppError } from './utils/errors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Routes
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/rooms.routes';
import bookingRoutes from './routes/bookings.routes';
import auditRoutes from './routes/audit.routes';
import statsRoutes from './routes/stats.routes';
import observationsRoutes from './routes/observations.routes';
import residenceRoutes from './routes/residences.routes';
import uploadsRoutes from './routes/uploads.routes';


const app = express();

// Security Middleware
app.use(helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'", "'unsafe-inline'"], // requerido por swagger-ui
            styleSrc:   ["'self'", "'unsafe-inline'"],
            imgSrc:     ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

// HTTP Request Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        httpLogger(req, res, Date.now() - start);
    });
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Residencia Éclat API',
}));
app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/observations', observationsRoutes);
app.use('/api/residences', residenceRoutes);
app.use('/api/uploads', uploadsRoutes);


// 404 Handler
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Endpoint no encontrado' });
});

// Global Error Handler
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    // Determinar si es un error operacional (esperado) o de programación
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const isOperational = isAppError ? err.isOperational : false;

    // Log del error
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel]('Error en request', {
        error: err.message,
        code: isAppError ? err.code : undefined,
        statusCode,
        isOperational,
        stack: !isOperational ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
    });

    // Respuesta al cliente
    res.status(statusCode).json({
        status: 'error',
        message: isOperational ? err.message : 'Error interno del servidor',
        ...(isAppError && err.code ? { code: err.code } : {}),
    });
});

// Start Server
const port = env.PORT;
app.listen(port, () => {
    logger.info('Servidor iniciado', {
        port,
        env: env.NODE_ENV,
        url: `http://localhost:${port}`,
    });
});
