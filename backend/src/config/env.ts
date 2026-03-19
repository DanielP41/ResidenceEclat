import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres'),
    JWT_ACCESS_EXPIRY: z.string().default('4h'),

    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    PORT: z.string().transform(Number).default('3001'),
    CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Placeholders for external services
    SENDGRID_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Error en las variables de entorno:', parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
