import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Residencia Éclat API',
            version: '1.0.0',
            description: 'API REST para el sistema de gestión de Residencia Éclat - Hospedaje de lujo',
            contact: {
                name: 'Soporte Técnico',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenido del endpoint /api/auth/login',
                },
            },
            schemas: {
                // Auth
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'admin@residencia-eclat.com' },
                        password: { type: 'string', example: '********' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string' },
                                refreshToken: { type: 'string' },
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer' },
                                        email: { type: 'string' },
                                        name: { type: 'string' },
                                        role: { type: 'string', enum: ['ADMIN', 'STAFF'] },
                                    },
                                },
                            },
                        },
                    },
                },

                // Residence
                Residence: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Sede San Telmo' },
                        address: { type: 'string', example: 'Av. San Juan 1234, CABA' },
                        description: { type: 'string' },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },

                // Room
                Room: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Suite Presidencial' },
                        description: { type: 'string' },
                        price: { type: 'number', example: 150.00 },
                        capacity: { type: 'integer', example: 2 },
                        status: {
                            type: 'string',
                            enum: ['AVAILABLE', 'PARTIAL_1', 'PARTIAL_2', 'PARTIAL_3', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'],
                            example: 'AVAILABLE'
                        },
                        amenities: { type: 'array', items: { type: 'string' }, example: ['WiFi', 'TV', 'Minibar'] },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        residenceId: { type: 'integer' },
                        residence: { $ref: '#/components/schemas/Residence' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateRoomRequest: {
                    type: 'object',
                    required: ['name', 'price', 'capacity', 'residenceId'],
                    properties: {
                        name: { type: 'string', minLength: 3, maxLength: 100 },
                        description: { type: 'string' },
                        price: { type: 'number', minimum: 0 },
                        capacity: { type: 'integer', minimum: 1 },
                        residenceId: { type: 'integer' },
                        status: { type: 'string', enum: ['AVAILABLE', 'PARTIAL_1', 'PARTIAL_2', 'PARTIAL_3', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'] },
                        amenities: { type: 'array', items: { type: 'string' } },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                    },
                },

                // Booking
                Guest: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string', example: 'Juan Pérez' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        documentType: { type: 'string', example: 'DNI' },
                        documentNumber: { type: 'string', example: '12345678' },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        roomId: { type: 'integer' },
                        room: { $ref: '#/components/schemas/Room' },
                        guestId: { type: 'integer' },
                        guest: { $ref: '#/components/schemas/Guest' },
                        checkIn: { type: 'string', format: 'date' },
                        checkOut: { type: 'string', format: 'date' },
                        totalNights: { type: 'integer' },
                        totalPrice: { type: 'number' },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
                            example: 'PENDING'
                        },
                        paymentStatus: {
                            type: 'string',
                            enum: ['PENDING', 'PAID', 'REFUNDED', 'PARTIAL'],
                            example: 'PENDING'
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateBookingRequest: {
                    type: 'object',
                    required: ['roomId', 'guest', 'checkIn', 'checkOut', 'acceptedTerms'],
                    properties: {
                        roomId: { type: 'integer' },
                        guest: {
                            type: 'object',
                            required: ['name', 'email'],
                            properties: {
                                name: { type: 'string', minLength: 3 },
                                email: { type: 'string', format: 'email' },
                                phone: { type: 'string' },
                                documentType: { type: 'string' },
                                documentNumber: { type: 'string' },
                            },
                        },
                        checkIn: { type: 'string', format: 'date', example: '2024-12-20' },
                        checkOut: { type: 'string', format: 'date', example: '2024-12-25' },
                        acceptedTerms: { type: 'boolean', example: true },
                    },
                },

                // Stats
                OccupancyStats: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', description: 'Total de habitaciones' },
                        occupied: { type: 'integer' },
                        reserved: { type: 'integer' },
                        partial: { type: 'integer' },
                        maintenance: { type: 'integer' },
                        vacant: { type: 'integer' },
                        percentages: {
                            type: 'object',
                            properties: {
                                occupied: { type: 'number' },
                                reserved: { type: 'number' },
                                partial: { type: 'number' },
                                vacant: { type: 'number' },
                            },
                        },
                    },
                },

                // Common
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        message: { type: 'string' },
                        code: { type: 'string' },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Autenticación y tokens' },
            { name: 'Rooms', description: 'Gestión de habitaciones' },
            { name: 'Bookings', description: 'Gestión de reservas' },
            { name: 'Residences', description: 'Gestión de sedes' },
            { name: 'Stats', description: 'Estadísticas de ocupación' },
            { name: 'Observations', description: 'Observaciones por sede' },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
