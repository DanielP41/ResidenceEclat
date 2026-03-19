import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Formato para desarrollo (legible en consola)
const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} ${level}: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        if (stack) {
            log += `\n${stack}`;
        }
        return log;
    })
);

// Formato para producción (JSON estructurado)
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

// Determinar nivel según entorno
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Crear logger
const logger = winston.createLogger({
    level,
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    defaultMeta: { service: 'residencia-eclat-api' },
    transports: [
        new winston.transports.Console(),
    ],
});

// En producción, agregar archivo de logs
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    logger.add(new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5,
    }));
}

// Helper para logging de requests HTTP
export const httpLogger = (req: any, res: any, duration: number) => {
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, 'HTTP Request', {
        method,
        url: originalUrl,
        status: statusCode,
        duration: `${duration}ms`,
        ip,
    });
};

export default logger;
