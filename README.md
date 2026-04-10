# Sazón Patrimonial - Backend

Este repositorio contiene la lógica de negocio y la API RESTful que alimenta la plataforma Sazón Patrimonial. Implementa una arquitectura orientada a servicios (SOA) con una separación clara de responsabilidades (Controladores, Rutas, Modelos y Middlewares).

#  Arquitectura y Tecnologías

* **Entorno de ejecución:** Node.js con Express.
* **Lenguaje:** TypeScript.
* **ORM:** Prisma Client (conectado a la base de datos PostgreSQL).
* **Seguridad y Autenticación:** JSON Web Tokens (JWT) para el manejo de sesiones seguras y `bcrypt` para el cifrado (hash) de contraseñas.
* **Infraestructura:** Preparado para despliegue en la nube (Render).

## Especificación de Endpoints Principales (API Spec)
La API sigue principios REST estándar:

Autenticación y Gestión de Usuarios (/api/auth y /api/client)
POST /api/auth/login - Autentica a un usuario y devuelve un token JWT.
POST /api/client/register - Registra un nuevo usuario o restaurantero. Incluye validación estricta de contraseña (mínimo 8 caracteres, alfanumérica y al menos un carácter especial).
Estadísticas y Análisis (/api/restaurants)
GET /api/restaurants/:id/stats - Obtiene la agregación en tiempo real de estadísticas del restaurante. Requiere Token.
POST /api/restaurants/:id/survey - Almacena una nueva respuesta proveniente de la encuesta de comensales.
POST /api/restaurants/:id/menu/click - Registra e incrementa el contador de descargas del menú.

## Pruebas y Aseguramiento de Calidad (QA)
Pruebas de Carga y Estrés: Se utilizó Apache JMeter simulando un máximo de 5 usuarios concurrentes (para evitar bloqueos en la nube) evaluando tiempos de respuesta de endpoints críticos.
Pruebas Manuales Funcionales: Validadas mediante colecciones de Postman.

## Declaración de uso de Inteligencia Artificial y recursos externos

Optimización de consultas SQL/ORM: Apoyo en la formulación de lógicas de agrupación complejas (COUNT, SUM, GROUP BY) en los controladores para extraer y formatear los datos enviados al panel de estadísticas del frontend.

Políticas de Seguridad: Generación de la Expresión Regular (Regex) implementada en los controladores para la validación estricta de contraseñas seguras, previniendo inyecciones o registros débiles.

Toda la arquitectura backend, configuración de Middlewares, diseño del JWT, creación de endpoints y despliegue en Render fue diseñada, comprendida e implementada en su totalidad por el equipo de desarrollo.
