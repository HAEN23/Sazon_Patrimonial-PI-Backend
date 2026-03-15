// Archivo: src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/index';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'DATABASE_URL',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ ERROR: Faltan las siguientes variables de entorno:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Asegúrate de tener un archivo .env con todas las variables requeridas.');
  console.error('   Ejemplo de Cloudinary: https://cloudinary.com/console\n');
  process.exit(1);
}

console.log('✅ Todas las variables de entorno están configuradas correctamente.');

// Crear aplicación Express
const app = express();
const port = process.env.PORT || 3003;

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(cors());
app.use(express.json());

// ============================================
// RUTAS
// ============================================
app.use('/api', routes);

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📡 API disponible en http://localhost:${port}/api`);
});
