import { IFileStorage } from '@/core/application/ports/IFileStorage';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Implementación de almacenamiento con AWS S3
 */
export class S3FileStorage implements IFileStorage {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    this.region = process.env.AWS_REGION || 'us-east-1';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
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

      // Generar key único
      const timestamp = Date.now();
      const key = `${folder}/${timestamp}-${filename}`;

      // Subir a S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: this.getContentType(filename),
      });

      await this.s3Client.send(command);

      // Retornar URL pública
      return this.getPublicUrl(key);
    } catch (error) {
      console.error('Error subiendo a S3:', error);
      throw new Error('Error al subir archivo a S3');
    }
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      // Extraer key del URL
      const key = this.extractKeyFromUrl(fileUrl);
      
      if (key) {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });

        await this.s3Client.send(command);
      }
    } catch (error) {
      console.error('Error eliminando de S3:', error);
      // No lanzar error, solo log
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Quitar el '/' inicial
    } catch {
      return null;
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}