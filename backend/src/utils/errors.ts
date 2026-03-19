export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        // Captura el stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

// Errores predefinidos para uso común
export class BadRequestError extends AppError {
    constructor(message: string = 'Solicitud inválida', code?: string) {
        super(message, 400, code);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'No autorizado', code?: string) {
        super(message, 401, code);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Acceso denegado', code?: string) {
        super(message, 403, code);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso no encontrado', code?: string) {
        super(message, 404, code);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflicto con el estado actual', code?: string) {
        super(message, 409, code);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Error de validación', code?: string) {
        super(message, 422, code);
    }
}

export class InternalError extends AppError {
    constructor(message: string = 'Error interno del servidor', code?: string) {
        super(message, 500, code, false);
    }
}
