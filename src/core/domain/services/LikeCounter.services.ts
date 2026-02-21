/**
 * Servicio de dominio para gestión de likes y popularidad
 * Contiene la lógica de negocio relacionada con el sistema de likes
 */
export class LikeCounterService {
  /**
   * Calcula el conteo de likes
   * (Puede incluir lógica adicional como ponderación por fecha)
   */
  static calculateLikesCount(favorites: number): number {
    return favorites;
  }

  /**
   * Determina si un restaurante es popular basado en sus likes
   * @param likesCount - Cantidad de likes
   * @returns true si es popular
   */
  static isPopular(likesCount: number): boolean {
    return likesCount >= 10;
  }

  /**
   * Obtiene el umbral para restaurantes trending
   * @returns Número mínimo de likes para ser trending
   */
  static getTrendingThreshold(): number {
    return 50;
  }

  /**
   * Determina si un restaurante es trending
   * @param likesCount - Cantidad de likes
   * @returns true si es trending
   */
  static isTrending(likesCount: number): boolean {
    return likesCount >= this.getTrendingThreshold();
  }

  /**
   * Obtiene el nivel de popularidad de un restaurante
   * @param likesCount - Cantidad de likes
   * @returns Nivel de popularidad
   */
  static getPopularityLevel(likesCount: number): 'low' | 'medium' | 'high' | 'trending' {
    if (likesCount < 10) return 'low';
    if (likesCount < 30) return 'medium';
    if (likesCount < 50) return 'high';
    return 'trending';
  }

  /**
   * Obtiene la etiqueta de popularidad
   * @param likesCount - Cantidad de likes
   * @returns Etiqueta legible
   */
  static getPopularityLabel(likesCount: number): string {
    const level = this.getPopularityLevel(likesCount);
    const labels = {
      low: 'Nuevo',
      medium: 'Popular',
      high: 'Muy Popular',
      trending: '🔥 Trending',
    };
    return labels[level];
  }

  /**
   * Obtiene el color asociado al nivel de popularidad
   * @param likesCount - Cantidad de likes
   * @returns Color en formato CSS
   */
  static getPopularityColor(likesCount: number): string {
    const level = this.getPopularityLevel(likesCount);
    const colors = {
      low: '#9CA3AF',    // gray
      medium: '#3B82F6', // blue
      high: '#8B5CF6',   // purple
      trending: '#EF4444', // red
    };
    return colors[level];
  }

  /**
   * Calcula el porcentaje de popularidad relativo
   * @param likesCount - Cantidad de likes
   * @param maxLikes - Máximo de likes en el sistema (opcional)
   * @returns Porcentaje de 0 a 100
   */
  static calculatePopularityPercentage(likesCount: number, maxLikes?: number): number {
    if (!maxLikes || maxLikes === 0) {
      // Sin referencia, usar trending como 100%
      return Math.min((likesCount / this.getTrendingThreshold()) * 100, 100);
    }
    return Math.min((likesCount / maxLikes) * 100, 100);
  }

  /**
   * Determina si un restaurante debe aparecer en la sección destacados
   * @param likesCount - Cantidad de likes
   * @param daysSinceCreation - Días desde la creación
   * @returns true si debe ser destacado
   */
  static shouldFeature(likesCount: number, daysSinceCreation: number): boolean {
    // Restaurantes nuevos con buen engagement
    if (daysSinceCreation <= 30 && likesCount >= 5) return true;
    
    // Restaurantes populares
    if (this.isPopular(likesCount)) return true;
    
    return false;
  }

  /**
   * Calcula el score de un restaurante para ordenamiento
   * Combina likes con otros factores
   * @param likesCount - Cantidad de likes
   * @param createdAt - Fecha de creación
   * @param photosCount - Cantidad de fotos de usuarios
   * @returns Score numérico
   */
  static calculateRestaurantScore(
    likesCount: number,
    createdAt: Date,
    photosCount: number = 0
  ): number {
    const daysSinceCreation = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Boost para restaurantes nuevos (primeros 60 días)
    const newRestaurantBoost = daysSinceCreation <= 60 ? 1.5 : 1;

    // Boost por fotos de usuarios (engagement)
    const photoBoost = 1 + (photosCount * 0.1);

    // Penalización por antigüedad (decae después de 180 días)
    const agePenalty = daysSinceCreation > 180 
      ? 1 - ((daysSinceCreation - 180) / 1000)
      : 1;

    const score = likesCount * newRestaurantBoost * photoBoost * Math.max(agePenalty, 0.5);

    return Math.round(score * 100) / 100;
  }

  /**
   * Obtiene insights sobre los likes
   * @param likesCount - Cantidad de likes actual
   * @param previousLikesCount - Likes en periodo anterior
   * @returns Insights y métricas
   */
  static getInsights(likesCount: number, previousLikesCount: number = 0) {
    const growth = likesCount - previousLikesCount;
    const growthPercentage = previousLikesCount > 0 
      ? ((growth / previousLikesCount) * 100).toFixed(1)
      : '0';

    return {
      current: likesCount,
      previous: previousLikesCount,
      growth,
      growthPercentage: `${growthPercentage}%`,
      isGrowing: growth > 0,
      level: this.getPopularityLevel(likesCount),
      label: this.getPopularityLabel(likesCount),
      color: this.getPopularityColor(likesCount),
      isPopular: this.isPopular(likesCount),
      isTrending: this.isTrending(likesCount),
      nextMilestone: this.getNextMilestone(likesCount),
    };
  }

  /**
   * Obtiene el siguiente hito de likes
   * @param currentLikes - Likes actuales
   * @returns Próximo hito y likes faltantes
   */
  static getNextMilestone(currentLikes: number): {
    likes: number;
    label: string;
    remaining: number;
  } {
    const milestones = [
      { likes: 10, label: 'Popular' },
      { likes: 30, label: 'Muy Popular' },
      { likes: 50, label: 'Trending' },
      { likes: 100, label: 'Top 100' },
      { likes: 250, label: 'Top 50' },
      { likes: 500, label: 'Top 10' },
      { likes: 1000, label: 'Leyenda' },
    ];

    const nextMilestone = milestones.find(m => m.likes > currentLikes);

    if (nextMilestone) {
      return {
        ...nextMilestone,
        remaining: nextMilestone.likes - currentLikes,
      };
    }

    // Ya alcanzó todos los hitos
    return {
      likes: currentLikes,
      label: 'Máximo Nivel',
      remaining: 0,
    };
  }

  /**
   * Genera recomendaciones para aumentar likes
   * @param likesCount - Likes actuales
   * @param photosCount - Fotos de usuarios
   * @param menuDownloads - Descargas del menú
   * @returns Array de recomendaciones
   */
  static getRecommendations(
    likesCount: number,
    photosCount: number = 0,
    menuDownloads: number = 0
  ): string[] {
    const recommendations: string[] = [];

    if (likesCount < 10) {
      recommendations.push('Comparte tu restaurante en redes sociales');
      recommendations.push('Invita a tus clientes a marcar como favorito');
    }

    if (photosCount < 5) {
      recommendations.push('Anima a tus clientes a subir fotos de su visita');
    }

    if (menuDownloads < likesCount * 0.5) {
      recommendations.push('Asegúrate de tener un menú atractivo y actualizado');
    }

    if (likesCount >= 10 && likesCount < 50) {
      recommendations.push('Mantén tu información actualizada para seguir creciendo');
      recommendations.push('Responde a los comentarios de tus clientes');
    }

    return recommendations;
  }
}