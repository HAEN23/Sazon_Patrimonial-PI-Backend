export class Url {
  private readonly value: string;

  constructor(url: string) {
    const trimmed = url.trim();
    
    if (!this.isValid(trimmed)) {
      throw new Error('URL inválida');
    }
    
    this.value = this.normalizeUrl(trimmed);
  }

  private isValid(url: string): boolean {
    if (!url || url.length === 0) {
      return false;
    }

    try {
      const urlObj = new URL(url);
      
      // Validar que tenga protocolo válido
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Validar que tenga host
      if (!urlObj.host) {
        return false;
      }

      return true;
    } catch {
      // Intentar agregar https:// si no tiene protocolo
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
  }

  private normalizeUrl(url: string): string {
    try {
      // Si ya tiene protocolo, usarlo
      const urlObj = new URL(url);
      return urlObj.href;
    } catch {
      // Si no tiene protocolo, agregar https://
      try {
        const urlObj = new URL(`https://${url}`);
        return urlObj.href;
      } catch {
        return url;
      }
    }
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    try {
      const urlObj = new URL(this.value);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  getProtocol(): string {
    try {
      const urlObj = new URL(this.value);
      return urlObj.protocol.replace(':', '');
    } catch {
      return '';
    }
  }

  getPath(): string {
    try {
      const urlObj = new URL(this.value);
      return urlObj.pathname;
    } catch {
      return '';
    }
  }

  // Validar si es una URL de red social específica
  isFacebook(): boolean {
    return this.value.includes('facebook.com') || this.value.includes('fb.com');
  }

  isInstagram(): boolean {
    return this.value.includes('instagram.com');
  }

  isTwitter(): boolean {
    return this.value.includes('twitter.com') || this.value.includes('x.com');
  }

  isYouTube(): boolean {
    return this.value.includes('youtube.com') || this.value.includes('youtu.be');
  }

  // Obtener el username de redes sociales
  getSocialUsername(): string | null {
    try {
      const urlObj = new URL(this.value);
      const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
      
      if (pathParts.length > 0) {
        return pathParts[0];
      }
      
      return null;
    } catch {
      return null;
    }
  }

  equals(other: Url): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  // Para mostrar en UI (sin protocolo)
  toDisplayString(): string {
    try {
      const urlObj = new URL(this.value);
      return urlObj.host + urlObj.pathname + urlObj.search;
    } catch {
      return this.value;
    }
  }
}