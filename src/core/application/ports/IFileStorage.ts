/**
 * Port para almacenamiento de archivos
 */
export interface IFileStorage {
  /**
   * Subir un archivo
   * @param file - Archivo a subir (Buffer o File)
   * @param folder - Carpeta destino
   * @param filename - Nombre del archivo
   * @returns URL del archivo subido
   */
  upload(file: File | Buffer, folder: string, filename: string): Promise<string>;

  /**
   * Eliminar un archivo
   * @param fileUrl - URL del archivo a eliminar
   */
  delete(fileUrl: string): Promise<void>;

  /**
   * Obtener URL pública de un archivo
   * @param path - Path del archivo
   * @returns URL pública
   */
  getPublicUrl(path: string): string;
}