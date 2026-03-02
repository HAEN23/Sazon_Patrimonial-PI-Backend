import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/docs
 * Documentación completa de la API
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3006';

  const documentation = {
    title: 'Sazón Patrimonial API',
    version: '1.0.0',
    description: 'API REST para el sistema de gestión de restaurantes tradicionales',
    baseUrl,
    author: 'HAEN23',
    repository: 'https://github.com/HAEN23/Sazon_Patrimonial-PI-Backend',
    
    endpoints: {
      // ========================================
      // AUTH
      // ========================================
      auth: {
        title: 'Autenticación',
        endpoints: {
          login: {
            method: 'POST',
            path: '/api/auth/login',
            description: 'Login de Admin/Restaurantero',
            auth: false,
            body: {
              email: 'string (required)',
              password: 'string (required)',
            },
            response: {
              user: 'User',
              accessToken: 'string',
              refreshToken: 'string',
            },
          },
          register: {
            method: 'POST',
            path: '/api/auth/register',
            description: 'Registro de Admin/Restaurantero',
            auth: false,
            body: {
              name: 'string (required)',
              email: 'string (required)',
              password: 'string (required, min 6)',
              type: 'admin | restaurantero',
            },
          },
          clientLogin: {
            method: 'POST',
            path: '/api/auth/client/login',
            description: 'Login de Cliente',
            auth: false,
            body: {
              email: 'string (required)',
              password: 'string (required)',
            },
          },
          clientRegister: {
            method: 'POST',
            path: '/api/auth/client/register',
            description: 'Registro de Cliente',
            auth: false,
            body: {
              name: 'string (required)',
              email: 'string (required)',
              password: 'string (required, min 6)',
              phone: 'string (optional, 10 digits)',
            },
          },
        },
      },

      // ========================================
      // RESTAURANTS
      // ========================================
      restaurants: {
        title: 'Restaurantes',
        endpoints: {
          getAll: {
            method: 'GET',
            path: '/api/restaurants',
            description: 'Listar todos los restaurantes',
            auth: false,
            query: {
              tags: 'string[] (optional)',
              limit: 'number (optional)',
              offset: 'number (optional)',
            },
          },
          create: {
            method: 'POST',
            path: '/api/restaurants',
            description: 'Crear restaurante',
            auth: 'Admin | Restaurantero',
            body: {
              name: 'string (required)',
              schedule: 'string (required)',
              phone: 'string (required, 10 digits)',
              tags: 'string[] (optional)',
              address: 'string (required)',
              facebook: 'string (optional)',
              instagram: 'string (optional)',
            },
          },
          getById: {
            method: 'GET',
            path: '/api/restaurants/:id',
            description: 'Obtener restaurante por ID',
            auth: false,
          },
          update: {
            method: 'PUT',
            path: '/api/restaurants/:id',
            description: 'Actualizar restaurante',
            auth: 'Admin | Restaurantero (owner)',
          },
          delete: {
            method: 'DELETE',
            path: '/api/restaurants/:id',
            description: 'Eliminar restaurante',
            auth: 'Admin | Restaurantero (owner)',
          },
          stats: {
            method: 'GET',
            path: '/api/restaurants/:id/stats',
            description: 'Estadísticas del restaurante',
            auth: false,
          },
        },
      },

      // ========================================
      // FAVORITES
      // ========================================
      favorites: {
        title: 'Favoritos (Likes)',
        endpoints: {
          toggle: {
            method: 'POST',
            path: '/api/favorites',
            description: 'Dar/Quitar like a restaurante',
            auth: 'Cliente',
            body: {
              restaurantId: 'number (required)',
            },
            response: {
              isFavorite: 'boolean',
              likesCount: 'number',
            },
          },
          check: {
            method: 'GET',
            path: '/api/favorites/check',
            description: 'Verificar si un restaurante es favorito',
            auth: 'Cliente',
            query: {
              restaurantId: 'number (required)',
            },
          },
        },
      },

      // ========================================
      // MENUS
      // ========================================
      menus: {
        title: 'Menús',
        endpoints: {
          getAll: {
            method: 'GET',
            path: '/api/menus',
            description: 'Listar menús',
            auth: 'Admin | Restaurantero',
            query: {
              ownerId: 'number (optional)',
            },
          },
          create: {
            method: 'POST',
            path: '/api/menus',
            description: 'Crear menú',
            auth: 'Admin | Restaurantero',
            body: {
              fileUrl: 'string (required)',
              menuUrl: 'string (required)',
              restaurantId: 'number (required)',
              status: 'activo | inactivo | pendiente',
            },
          },
          update: {
            method: 'PUT',
            path: '/api/menus/:id',
            description: 'Actualizar menú',
            auth: 'Admin | Restaurantero (owner)',
          },
          delete: {
            method: 'DELETE',
            path: '/api/menus/:id',
            description: 'Eliminar menú',
            auth: 'Admin | Restaurantero (owner)',
          },
          getByRestaurant: {
            method: 'GET',
            path: '/api/menus/restaurant/:restaurantId',
            description: 'Obtener menús de un restaurante',
            auth: false,
            query: {
              activeOnly: 'boolean (optional)',
            },
          },
          download: {
            method: 'POST',
            path: '/api/menus/download',
            description: 'Descargar menú (requiere like)',
            auth: 'Cliente',
            body: {
              restaurantId: 'number (required)',
            },
          },
        },
      },

      // ========================================
      // PHOTOS
      // ========================================
      photos: {
        title: 'Fotos de usuarios',
        endpoints: {
          upload: {
            method: 'POST',
            path: '/api/photos',
            description: 'Subir foto (requiere like)',
            auth: 'Cliente',
            contentType: 'multipart/form-data',
            body: {
              file: 'File (required)',
              restaurantId: 'number (required)',
            },
          },
          delete: {
            method: 'DELETE',
            path: '/api/photos/:id',
            description: 'Eliminar foto',
            auth: 'Cliente (owner)',
          },
          getByRestaurant: {
            method: 'GET',
            path: '/api/photos/restaurant/:restaurantId',
            description: 'Obtener fotos de un restaurante',
            auth: false,
          },
          getByClient: {
            method: 'GET',
            path: '/api/photos/client/:clientId',
            description: 'Obtener fotos de un cliente',
            auth: 'Cliente',
          },
        },
      },

      // ========================================
      // APPLICATIONS
      // ========================================
      applications: {
        title: 'Solicitudes de restaurantes',
        endpoints: {
          create: {
            method: 'POST',
            path: '/api/applications',
            description: 'Crear solicitud',
            auth: 'Restaurantero',
            body: {
              proposedRestaurantName: 'string (required)',
              ownerName: 'string (required)',
              email: 'string (required)',
              schedule: 'string (required)',
            },
          },
          getByOwner: {
            method: 'GET',
            path: '/api/applications/owner/:ownerId',
            description: 'Obtener solicitudes de un owner',
            auth: 'Admin | Restaurantero',
          },
          approve: {
            method: 'POST',
            path: '/api/applications/:id/approve',
            description: 'Aprobar solicitud',
            auth: 'Admin',
          },
          reject: {
            method: 'POST',
            path: '/api/applications/:id/reject',
            description: 'Rechazar solicitud',
            auth: 'Admin',
            body: {
              reason: 'string (optional)',
            },
          },
        },
      },

      // ========================================
      // ZONES
      // ========================================
      zones: {
        title: 'Zonas',
        endpoints: {
          getAll: {
            method: 'GET',
            path: '/api/zones',
            description: 'Listar todas las zonas',
            auth: false,
          },
          create: {
            method: 'POST',
            path: '/api/zones',
            description: 'Crear zona',
            auth: 'Admin | Restaurantero',
            body: {
              name: 'string (required)',
            },
          },
          update: {
            method: 'PUT',
            path: '/api/zones/:id',
            description: 'Actualizar zona',
            auth: 'Admin | Restaurantero (owner)',
          },
          delete: {
            method: 'DELETE',
            path: '/api/zones/:id',
            description: 'Eliminar zona',
            auth: 'Admin | Restaurantero (owner)',
          },
        },
      },

      // ========================================
      // STATISTICS
      // ========================================
      statistics: {
        title: 'Estadísticas',
        endpoints: {
          global: {
            method: 'GET',
            path: '/api/statistics/global',
            description: 'Estadísticas globales del sistema',
            auth: 'Admin',
          },
          owner: {
            method: 'GET',
            path: '/api/statistics/owner/:ownerId',
            description: 'Estadísticas de un restaurantero',
            auth: 'Admin | Restaurantero',
          },
          restaurant: {
            method: 'GET',
            path: '/api/statistics/restaurant/:id',
            description: 'Estadísticas de un restaurante',
            auth: false,
          },
        },
      },

      // ========================================
      // USERS
      // ========================================
      users: {
        title: 'Usuarios',
        endpoints: {
          getAll: {
            method: 'GET',
            path: '/api/users',
            description: 'Listar todos los usuarios',
            auth: 'Admin',
          },
          create: {
            method: 'POST',
            path: '/api/users',
            description: 'Crear usuario',
            auth: 'Admin',
          },
          getById: {
            method: 'GET',
            path: '/api/users/:id',
            description: 'Obtener usuario por ID',
            auth: 'Admin',
          },
          update: {
            method: 'PUT',
            path: '/api/users/:id',
            description: 'Actualizar usuario',
            auth: 'Admin',
          },
          delete: {
            method: 'DELETE',
            path: '/api/users/:id',
            description: 'Eliminar usuario',
            auth: 'Admin',
          },
        },
      },

      // ========================================
      // CLIENTS
      // ========================================
      clients: {
        title: 'Clientes',
        endpoints: {
          getProfile: {
            method: 'GET',
            path: '/api/clients/:id',
            description: 'Obtener perfil del cliente',
            auth: 'Cliente (propio perfil)',
          },
          updateProfile: {
            method: 'PUT',
            path: '/api/clients/:id',
            description: 'Actualizar perfil del cliente',
            auth: 'Cliente (propio perfil)',
            body: {
              name: 'string (optional)',
              phone: 'string (optional, 10 digits)',
              email: 'string (optional)',
            },
          },
          getFavorites: {
            method: 'GET',
            path: '/api/clients/:id/favorites',
            description: 'Obtener restaurantes favoritos',
            auth: 'Cliente (propios favoritos)',
          },
        },
      },

      // ========================================
      // UTILITY
      // ========================================
      utility: {
        title: 'Utilidades',
        endpoints: {
          health: {
            method: 'GET',
            path: '/api/health',
            description: 'Health check del servidor',
            auth: false,
          },
          docs: {
            method: 'GET',
            path: '/api/docs',
            description: 'Esta documentación',
            auth: false,
          },
        },
      },
    },

    // ========================================
    // AUTHENTICATION
    // ========================================
    authentication: {
      type: 'Bearer Token (JWT)',
      headerFormat: 'Authorization: Bearer <token>',
      tokenExpiry: {
        accessToken: '15 minutes',
        refreshToken: '7 days',
      },
      example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },

    // ========================================
    // ERROR CODES
    // ========================================
    errorCodes: {
      400: 'Bad Request - Datos inválidos',
      401: 'Unauthorized - No autenticado',
      403: 'Forbidden - Sin permisos',
      404: 'Not Found - Recurso no encontrado',
      409: 'Conflict - Conflicto (ej: email duplicado)',
      500: 'Internal Server Error - Error del servidor',
      503: 'Service Unavailable - Servicio no disponible',
    },

    // ========================================
    // RESPONSE FORMAT
    // ========================================
    responseFormat: {
      success: {
        success: true,
        data: 'any',
        message: 'string (optional)',
      },
      error: {
        success: false,
        error: 'string',
        details: 'object (optional)',
      },
    },

    // ========================================
    // EXAMPLES
    // ========================================
    examples: {
      login: {
        request: {
          method: 'POST',
          url: `${baseUrl}/api/auth/login`,
          body: {
            email: 'admin@sazonpatrimonial.com',
            password: 'password123',
          },
        },
        response: {
          success: true,
          data: {
            user: {
              id: 1,
              name: 'Administrador',
              email: 'admin@sazonpatrimonial.com',
              type: 'admin',
            },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      getRestaurants: {
        request: {
          method: 'GET',
          url: `${baseUrl}/api/restaurants?tags=Tradicional,Familiar`,
        },
        response: {
          success: true,
          data: [
            {
              id: 1,
              name: 'La Tradición Chiapaneca',
              schedule: 'Lunes a Domingo 8:00 AM - 10:00 PM',
              phone: '9611111111',
              tags: ['Comida tradicional', 'Chiapaneca', 'Familiar'],
              address: 'Av. Central 123, Tuxtla Gutiérrez',
              likesCount: 150,
            },
          ],
          total: 1,
        },
      },
      toggleFavorite: {
        request: {
          method: 'POST',
          url: `${baseUrl}/api/favorites`,
          headers: {
            Authorization: 'Bearer <client-token>',
          },
          body: {
            restaurantId: 1,
          },
        },
        response: {
          success: true,
          data: {
            isFavorite: true,
            likesCount: 151,
          },
          message: 'Like agregado',
        },
      },
    },
  };

  return NextResponse.json(documentation, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
    },
  });
}