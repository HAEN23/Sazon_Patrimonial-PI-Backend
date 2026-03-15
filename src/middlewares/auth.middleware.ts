// Archivo: src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    
    if (result.rows.length > 0 && result.rows[0].id_rol === 1) { 
      next();
    } else {
      res.status(403).json({ success: false, message: 'Acceso denegado: Se requiere rol de administrador' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error verificando rol' });
  }
};