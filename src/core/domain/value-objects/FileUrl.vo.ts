export class FileUrl {
  private readonly value: string;

  constructor(fileUrl: string) {
    const trimmed = fileUrl.trim();
    
    if (!this.isValid(trimmed)) {
      throw new Error('La URL del archivo no puede estar vacía');
    }
    
    this.value = trimmed;
  }

  private isValid(fileUrl: string): boolean {
    if (!fileUrl || fileUrl.length === 0) {
      return false;
    }

    // Validar longitud máxima
    if (fileUrl.length > 2048) {
      return false;
    }

    return true;
  }

  getValue(): string {
    return this.value;
  }

  // Obtener el nombre del archivo
  getFileName(): string {
    const parts = this.value.split('/');
    return parts[parts.length - 1] || '';
  }

  // Obtener la extensión del archivo
  getExtension(): string {
    const fileName = this.getFileName();
    const parts = fileName.split('.');
    
    if (parts.length < 2) {
      return '';
    }
    
    return parts[parts.length - 1].toLowerCase();
  }

  // Obtener el nombre sin extensión
  getFileNameWithoutExtension(): string {
    const fileName = this.getFileName();
    const lastDotIndex = fileName.lastIndexOf('.');
    
    if (lastDotIndex === -1) {
      return fileName;
    }
    
    return fileName.substring(0, lastDotIndex);
  }

  // Validar si es una imagen
  isImage(): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
    return imageExtensions.includes(this.getExtension());
  }

  // Validar si es un PDF
  isPdf(): boolean {
    return this.getExtension() === 'pdf';
  }

  // Validar si es un documento
  isDocument(): boolean {
    const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    return docExtensions.includes(this.getExtension());
  }

  // Validar si es un video
  isVideo(): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    return videoExtensions.includes(this.getExtension());
  }

  // Obtener el tipo MIME aproximado
  getMimeType(): string {
    const ext = this.getExtension();
    
    const mimeTypes: { [key: string]: string } = {
      // Imágenes
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      ico: 'image/x-icon',
      
      // Documentos
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      
      // Videos
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      flv: 'video/x-flv',
      webm: 'video/webm',
      mkv: 'video/x-matroska',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Obtener el tamaño del archivo desde la URL (si está disponible)
  getSizeFromUrl(): number | null {
    // Esto requeriría hacer una petición HEAD, se deja como placeholder
    return null;
  }

  // Validar si es una URL absoluta
  isAbsolute(): boolean {
    return this.value.startsWith('http://') || 
           this.value.startsWith('https://') ||
           this.value.startsWith('//');
  }

  // Validar si es una URL relativa
  isRelative(): boolean {
    return !this.isAbsolute();
  }

  // Convertir a URL absoluta si es necesario
  toAbsolute(baseUrl?: string): string {
    if (this.isAbsolute()) {
      return this.value;
    }

    if (!baseUrl) {
      // Usar la URL base del entorno
      baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }

    return new URL(this.value, baseUrl).href;
  }

  equals(other: FileUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  // Para debugging
  toDebugString(): string {
    return `FileUrl(
      value: ${this.value},
      fileName: ${this.getFileName()},
      extension: ${this.getExtension()},
      isImage: ${this.isImage()},
      isPdf: ${this.isPdf()},
      mimeType: ${this.getMimeType()}
    )`;
  }
}