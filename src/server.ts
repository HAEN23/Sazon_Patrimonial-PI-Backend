import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3001', 10);

// Inicializar Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/**
 * Iniciar servidor
 */
async function startServer() {
  try {
    // Preparar Next.js
    await app.prepare();
    console.log('✅ Next.js preparado');

    // Crear servidor HTTP
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('❌ Error manejando request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Escuchar en el puerto
    server.listen(port, () => {
      console.log('\n🚀 ========================================');
      console.log(`🚀 Servidor corriendo en http://${hostname}:${port}`);
      console.log(`📊 Modo: ${dev ? 'Desarrollo' : 'Producción'}`);
      console.log(`📚 API Docs: http://${hostname}:${port}/api/docs`);
      console.log(`❤️  Health: http://${hostname}:${port}/api/health`);
      console.log('🚀 ========================================\n');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} recibido, cerrando servidor...`);
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('❌ Forzando cierre del servidor');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar
startServer();