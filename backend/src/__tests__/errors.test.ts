import { describe, it, expect } from 'vitest';
import {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    InternalError,
} from '../utils/errors';

describe('AppError', () => {
    it('crea un error con statusCode 500 por defecto', () => {
        const err = new AppError('algo falló');
        expect(err.message).toBe('algo falló');
        expect(err.statusCode).toBe(500);
        expect(err.isOperational).toBe(true);
        expect(err.code).toBeUndefined();
    });

    it('acepta statusCode, code e isOperational personalizados', () => {
        const err = new AppError('test', 418, 'TEAPOT', false);
        expect(err.statusCode).toBe(418);
        expect(err.code).toBe('TEAPOT');
        expect(err.isOperational).toBe(false);
    });

    it('es una instancia de Error', () => {
        expect(new AppError('x')).toBeInstanceOf(Error);
    });
});

describe('BadRequestError', () => {
    it('usa statusCode 400', () => {
        const err = new BadRequestError();
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Solicitud inválida');
    });

    it('acepta mensaje y code personalizados', () => {
        const err = new BadRequestError('fechas inválidas', 'INVALID_DATES');
        expect(err.message).toBe('fechas inválidas');
        expect(err.code).toBe('INVALID_DATES');
    });
});

describe('UnauthorizedError', () => {
    it('usa statusCode 401', () => {
        expect(new UnauthorizedError().statusCode).toBe(401);
    });
});

describe('ForbiddenError', () => {
    it('usa statusCode 403', () => {
        expect(new ForbiddenError().statusCode).toBe(403);
    });
});

describe('NotFoundError', () => {
    it('usa statusCode 404', () => {
        const err = new NotFoundError('Habitación no encontrada', 'ROOM_NOT_FOUND');
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('ROOM_NOT_FOUND');
        expect(err.isOperational).toBe(true);
    });
});

describe('ConflictError', () => {
    it('usa statusCode 409', () => {
        const err = new ConflictError('habitación no disponible', 'ROOM_NOT_AVAILABLE');
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('ROOM_NOT_AVAILABLE');
    });
});

describe('ValidationError', () => {
    it('usa statusCode 422', () => {
        expect(new ValidationError().statusCode).toBe(422);
    });
});

describe('InternalError', () => {
    it('usa statusCode 500 y isOperational false', () => {
        const err = new InternalError();
        expect(err.statusCode).toBe(500);
        expect(err.isOperational).toBe(false);
    });
});
