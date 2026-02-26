import { ILogger } from '@/core/application/ports/ILogger';
import winston from 'winston';
import path from 'path';

/**
 * Implementación de logging con Winston
 */
export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    // Formato personalizado
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          msg += ` ${JSON.stringify(meta)}`;
        }
        
        return msg;
      })
    );

    // Configurar transports
    const transports: winston.transport[] = [
      // Console (desarrollo)
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          customFormat
        ),
      }),
    ];

    // Archivos (producción)
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        // Errores
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Todos los logs
        new winston.transports.File({
          filename: path.join('logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: customFormat,
      transports,
      exitOnError: false,
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: any): void {
    if (error) {
      this.logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
      this.logger.error(message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}

// Instancia global (singleton)
export const logger = new WinstonLogger();