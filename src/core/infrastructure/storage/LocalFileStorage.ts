import { IFileStorage } from '@/core/application/ports/IFileStorage';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';

/**
 * Implementación de almacenamiento local
 * Para desarrollo
 */
export class LocalFileStorage implements IFileStorage {
  private readonly uploadDir: string;
  private readonly publicUrl: string;

  constructor(uploadDir: string = './public/uploads', publicUrl: string = '/uploads') {
    this.uploadDir = uploadDir;
    this.publicUrl = publicUrl;
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: File | Buffer, folder: string, filename: string): Promise<string> {
    // Crear carpeta si no existe
    const folderPath = path.join(this.uploadDir, folder);
    await fs.mkdir(folderPath, { recursive: true });

    // Generar nombre único
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;
    const filePath = path.join(folderPath, uniqueFilename);

    // Guardar archivo
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      // Para File (browser)
      buffer = Buffer.from(await file.arrayBuffer());
    }
    
    await fs.writeFile(filePath, buffer);

    // Retornar URL pública
    return `${this.publicUrl}/${folder}/${uniqueFilename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      // Extraer path del URL
      const relativePath = fileUrl.replace(this.publicUrl, '');
      const filePath = path.join(this.uploadDir, relativePath);
      
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error eliminando archivo local:', error);
      // No lanzar error si el archivo no existe
    }
  }

  getPublicUrl(filePath: string): string {
    return `${this.publicUrl}/${filePath}`;
  }
}