// Archivo: src/middlewares/upload.middleware.ts
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadFields = upload.fields([
  { name: 'foto_portada', maxCount: 1 },
  { name: 'foto_2', maxCount: 1 },
  { name: 'foto_3', maxCount: 1 },
  { name: 'menu_pdf', maxCount: 1 }
]);

export const uploadSingle = upload.single('file');