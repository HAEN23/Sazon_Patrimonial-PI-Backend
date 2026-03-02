import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Modo experimental para API Routes optimizadas
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },

  // Headers CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.FRONTEND_URL || '*' 
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' 
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },

  // Optimizaciones de producción
  poweredByHeader: false,

  // Variables de entorno públicas
  env: {
    APP_URL: process.env.APP_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
  },

  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;