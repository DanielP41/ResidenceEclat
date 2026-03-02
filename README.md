# Residencia Éclat — Sistema de Gestión de Alquiler de Habitaciones

Sistema web completo para la gestión de una residencia de alquiler de habitaciones. Permite la visualización de habitaciones disponibles, gestión de reservas, administración de disponibilidad y un panel administrativo robusto.

## Stack Tecnológico

### Backend

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL 16
- **ORM:** Prisma
- **Auth:** JWT (access + refresh tokens)
- **Validación:** Zod

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animaciones:** Framer Motion
- **Galería:** Swiper.js
- **Fechas:** date-fns

## Requisitos

- Node.js 18+
- Docker (para PostgreSQL local)

## Setup Local

### 1. Base de Datos

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
residencia-eclat/
├── backend/           # API REST (Express + Prisma)
│   ├── prisma/        # Schema y seeds
│   └── src/           # Código fuente
│       ├── config/    # Configuración
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/          # App Next.js
│   ├── app/           # Páginas (App Router)
│   ├── components/    # Componentes React
│   └── lib/           # Utilidades
└── docker-compose.yml # PostgreSQL local
```
