# Residencia Eclat - Stack Tecnologico

Este documento detalla las tecnologias y herramientas utilizadas en el desarrollo de la plataforma de gestion y reserva de la Residencia Eclat.

## Frontend (Interfaz de Usuario)

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router) - El estandar moderno para aplicaciones React de alto rendimiento.
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Tipado estatico para un codigo mas robusto y mantenible.
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) - Utilizado para crear una estetica de lujo personalizada y responsive.
* **Animaciones:** [Framer Motion](https://www.framer.com/motion/) - Para transiciones suaves, micro-interacciones y menus dinamicos.
* **Iconografia:** [Lucide React](https://lucide.dev/) - Set de iconos modernos y consistentes.
* **Mapas:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) - Visualizacion de las sedes con pines dorados personalizados.
* **Internacionalizacion (i18n):** Sistema de gestion de idiomas propio (`LanguageContext`) con soporte para Español, Ingles y Portugues.

## Backend (Servidor y Logica)

* **Entorno:** [Node.js](https://nodejs.org/) - Motor de ejecucion de JavaScript en el servidor.
* **Framework:** [Express.js](https://expressjs.com/) - Logica de API para la gestion de habitaciones y usuarios.
* **ORM:** [Prisma](https://www.prisma.io/) - Gestion de consultas a la base de datos de manera tipada y segura.
* **Seguridad y Autenticacion:**
  * **JWT (JSON Web Tokens):** Para el acceso seguro al panel de administracion.
  * **Bcrypt:** Hasheo y salteo de contraseñas.
  * **Helmet:** Proteccion contra vulnerabilidades web comunes.
  * **CORS:** Configuracion de intercambio de recursos entre el front y el back.

## Base de Datos e Infraestructura

* **Motor:** [PostgreSQL 16](https://www.postgresql.org/) - Base de datos relacional potente y escalable.
* **Contenedores:** [Docker](https://www.docker.com/) - Utilizado para aislar y correr la instancia de la base de datos.
* **Configuracion:** Gestion de secretos y puertos mediante archivos `.env`.

## Caracteristicas Destacadas

* **Estetica Luxury:** Branding enfocado en el sector premium con tipografia Serif y paleta de colores azul marino/oro.
* **Dashboard Administrativo:** Panel centralizado con graficos circulares de ocupacion dinamica.
* **Filtros Inteligentes:** Buscador de habitaciones por sedes (San Telmo, Parque Avellaneda I/II).
* **Optimizacion de Imagenes:** Uso de `next/image` para carga adaptativa y visualizacion perfecta.
