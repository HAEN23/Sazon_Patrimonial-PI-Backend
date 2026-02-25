import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

/**
 * Implementación de almacenamiento con Cloudinary
 * Para producción
 */
export class CloudinaryStorage implements IFileStorage {
  constructor() {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(file: File | Buffer, folder: string, filename: string): Promise<string> {
    try {
      let buffer: Buffer;

      // Convertir File a Buffer si es necesario
      if (Buffer.isBuffer(file)) {
        buffer = file;
      } else {
        buffer = Buffer.from(await file.arrayBuffer());
      }

      // Subir a Cloudinary
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `sazon-patrimonial/${folder}`,
            public_id: filename,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        );

        // Escribir buffer al stream
        uploadStream.end(buffer);
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error subiendo a Cloudinary:', error);
      throw new Error('Error al subir archivo a Cloudinary');
    }
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      // Extraer public_id del URL
      const publicId = this.extractPublicId(fileUrl);
      
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Error eliminando de Cloudinary:', error);
      // No lanzar error, solo log
    }
  }

  getPublicUrl(path: string): string {
    // En Cloudinary, el path ya es la URL completa
    return path;
  }

  private extractPublicId(url: string): string | null {
    try {
      // Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234567890/sazon-patrimonial/menus/menu1.pdf
      // Public ID sería: sazon-patrimonial/menus/menu1
      
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        // Tomar desde después de 'upload/vXXXXXX/' hasta el final
        const pathWithExtension = parts.slice(uploadIndex + 2).join('/');
        
        // Remover la extensión del archivo (solo la última)
        const lastDotIndex = pathWithExtension.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          return pathWithExtension.substring(0, lastDotIndex);
        }
        
        return pathWithExtension;
      }
      
      return null;
    } catch {
      return null;
    }
  }
}