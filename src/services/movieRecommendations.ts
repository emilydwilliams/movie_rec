import { tmdbService, type TMDBMovie, type MovieFilters } from './tmdb';
import { cache, CacheService } from './cache';

export type AgeGroup = 'preschool' | 'elementary' | 'tweens' | 'teens' | 'adults';

export type ContentPreferences = {
  avoidGriefLoss: boolean;
  avoidSubstances: boolean;
  avoidRomanceSexuality: boolean;
  avoidViolenceScare: boolean;
  avoidProfanity: boolean;
  avoidProductPlacement: boolean;
};

export type VibeType = 'cozy' | 'silly' | 'adventure' | 'artsy' | 'musical' | 'classic' | 'millennial';

type VibeConfig = {
  genres: string[];
  yearStart?: number;
  yearEnd?: number;
  minRating: number;
  preferredCertifications: string[];
  keywords?: string[];
};

const VIBE_CONFIGS: Record<VibeType, VibeConfig> = {
  cozy: {
    genres: ['family', 'fantasy', 'animation'],
    minRating: 7.0,
    preferredCertifications: ['G', 'PG'],
    keywords: ['magic', 'cozy', 'heartwarming', 'friendship', 'family']
  },
  silly: {
    genres: ['comedy', 'family', 'animation'],
    minRating: 6.5,
    preferredCertifications: ['G', 'PG'],
    keywords: ['funny', 'silly', 'comedy', 'laugh', 'humor']
  },
  adventure: {
    genres: ['adventure', 'action', 'sci-fi', 'fantasy'],
    minRating: 7.0,
    preferredCertifications: ['PG', 'PG-13'],
    keywords: ['adventure', 'quest', 'journey', 'action', 'hero']
  },
  artsy: {
    genres: ['animation', 'drama', 'foreign'],
    minRating: 7.5,
    preferredCertifications: ['G', 'PG', 'PG-13'],
    keywords: ['artistic', 'animation', 'creative', 'unique', 'beautiful']
  },
  musical: {
    genres: ['music'],
    minRating: 6.0,
    preferredCertifications: ['G', 'PG', 'PG-13'],
    keywords: ['musical', 'singing', 'dance', 'broadway', 'song', 'performance']
  },
  classic: {
    genres: ['family', 'comedy', 'drama', 'adventure'],
    yearEnd: 1980,
    minRating: 7.5,
    preferredCertifications: ['G', 'PG'],
    keywords: ['classic', 'timeless', 'vintage', 'nostalgic']
  },
  millennial: {
    genres: ['family', 'comedy', 'adventure', 'animation'],
    yearStart: 1980,
    yearEnd: 2010,
    minRating: 6.5,
    preferredCertifications: ['G', 'PG', 'PG-13'],
    keywords: ['90s', '80s', 'childhood', 'retro', 'nostalgia']
  }
};

// Add musical keywords to help identify musical content
const MUSICAL_KEYWORDS = [
  'musical',
  'singing',
  'dance',
  'song',
  'concert',
  'broadway',
  'music',
  'choreography',
  'performance'
];

type ThemeConfig = {
  keywords: string[];
  additionalGenres: string[];
};

const THEME_CONFIGS: Record<string, ThemeConfig> = {
  animals: {
    keywords: ['animal', 'dog', 'cat', 'wildlife', 'zoo', 'nature'],
    additionalGenres: ['documentary', 'family']
  },
  sports: {
    keywords: ['sports', 'baseball', 'football', 'basketball', 'soccer', 'olympics'],
    additionalGenres: ['sport']
  },
  summer: {
    keywords: ['summer', 'beach', 'vacation', 'camp', 'adventure'],
    additionalGenres: ['adventure', 'comedy']
  },
  halloween: {
    keywords: ['halloween', 'friendly ghost', 'witch', 'magic', 'supernatural'],
    additionalGenres: ['fantasy', 'family']
  },
  christmas: {
    keywords: ['christmas', 'holiday', 'santa', 'winter', 'festive'],
    additionalGenres: ['family']
  },
  winter: {
    keywords: ['winter', 'snow', 'ice', 'skiing', 'arctic'],
    additionalGenres: ['adventure', 'family']
  }
};

export class MovieRecommendationService {
  private genreIdMap: Map<string, number> = new Map();
  private readonly GENRE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MOVIE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private currentVibe: VibeType = 'cozy'; // Default vibe

  constructor() {
    this.initializeGenreMap();
  }

  private async initializeGenreMap() {
    try {
      // Try to get genres from cache first
      const cachedGenres = cache.get<TMDBGenre[]>('genres');
      if (cachedGenres) {
        cachedGenres.forEach(genre => {
          this.genreIdMap.set(genre.name.toLowerCase(), genre.id);
        });
        return;
      }

      // If not in cache, fetch from API
      const genres = await tmdbService.getGenres();
      genres.forEach(genre => {
        this.genreIdMap.set(genre.name.toLowerCase(), genre.id);
      });

      // Cache the genres
      cache.set('genres', genres, this.GENRE_CACHE_TTL);
    } catch (error) {
      console.error('Failed to initialize genre map:', error);
    }
  }

  private getGenreIds(genreNames: string[]): number[] {
    return genreNames
      .map(name => this.genreIdMap.get(name.toLowerCase()))
      .filter((id): id is number => id !== undefined);
  }

  private getGenreNames(genreIds: number[]): string[] {
    return genreIds
      .map(id => {
        const genre = Array.from(this.genreIdMap.entries()).find(([_, genreId]) => genreId === id);
        return genre ? genre[0] : '';
      })
      .filter(name => name !== '');
  }

  private getCertificationsForAgeGroups(ageGroups: AgeGroup[]): string[] {
    // Base certification map showing which age groups can watch which ratings
    const certificationMap: Record<string, AgeGroup[]> = {
      'G': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
      'PG': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
      'PG-13': ['tweens', 'teens', 'adults'],
      'R': ['adults']
    };

    // If teens are the youngest viewers, prioritize PG-13 content
    const youngestGroup = ageGroups.sort((a, b) => {
      const ageOrder = ['preschool', 'elementary', 'tweens', 'teens', 'adults'];
      return ageOrder.indexOf(a) - ageOrder.indexOf(b);
    })[0];

    if (youngestGroup === 'teens') {
      // Return certifications prioritizing PG-13, but include PG as fallback
      return ['PG-13', 'PG'];
    }

    // Otherwise return all valid certifications for the age groups
    return Object.entries(certificationMap)
      .filter(([_, allowedGroups]) => 
        ageGroups.some(group => allowedGroups.includes(group)))
      .map(([cert]) => cert);
  }

  private generateMovieCacheKey(
    vibe: VibeType,
    ageGroups: AgeGroup[],
    preferences: ContentPreferences,
    theme?: string
  ): string {
    return CacheService.generateKey([
      'movies',
      vibe,
      ...ageGroups.sort(),
      theme || 'no_theme',
      Object.entries(preferences)
        .map(([key, value]) => `${key}_${value}`)
        .sort()
        .join(',')
    ]);
  }

  private async getMoviesForVibe(
    vibe: VibeType,
    ageGroups: AgeGroup[],
    preferences: ContentPreferences,
    theme?: string
  ): Promise<TMDBMovie[]> {
    const cacheKey = this.generateMovieCacheKey(vibe, ageGroups, preferences, theme);
    
    // Try to get from cache first
    const cachedMovies = cache.get<TMDBMovie[]>(cacheKey);
    if (cachedMovies) {
      console.log('Using cached movies for:', vibe, theme);
      return cachedMovies;
    }

    // If not in cache, fetch from API
    console.log('Fetching fresh movies for:', vibe, theme);
    const config = VIBE_CONFIGS[vibe];
    
    // Combine vibe genres with theme genres if theme is specified
    let genres = [...config.genres];
    if (theme && theme !== 'none' && THEME_CONFIGS[theme]) {
      genres = [...genres, ...THEME_CONFIGS[theme].additionalGenres];
    }
    const genreIds = this.getGenreIds(genres);
    
    // Get allowed certifications based on age groups
    const allowedCertifications = this.getCertificationsForAgeGroups(ageGroups);
    
    // Intersect with vibe's preferred certifications
    const certifications = config.preferredCertifications.filter(
      cert => allowedCertifications.includes(cert)
    );

    // For musicals, add the vibe-specific keywords
    const keywords = vibe === 'musical' 
      ? (config as typeof VIBE_CONFIGS['musical']).keywords
      : (theme && theme !== 'none' ? THEME_CONFIGS[theme]?.keywords : undefined);

    const filters: MovieFilters = {
      genres: genreIds,
      yearStart: config.yearStart,
      yearEnd: config.yearEnd,
      minRating: config.minRating,
      certifications,
      language: 'en',
      keywords
    };

    try {
      const response = await tmdbService.discoverMovies(filters);
      
      // Cache the results
      cache.set(cacheKey, response.results, this.MOVIE_CACHE_TTL);
      
      return response.results;
    } catch (error) {
      console.error(`Failed to fetch movies for vibe ${vibe}:`, error);
      return [];
    }
  }

  async getRecommendations(
    vibe: VibeType,
    ageGroups: AgeGroup[],
    preferences: ContentPreferences,
    limit: number = 10,
    theme?: string
  ): Promise<TMDBMovie[]> {
    // Set the current vibe for scoring
    this.currentVibe = vibe;

    // Wait for genre map to be initialized if it hasn't been
    if (this.genreIdMap.size === 0) {
      await this.initializeGenreMap();
    }

    const movies = await this.getMoviesForVibe(vibe, ageGroups, preferences, theme);
    
    // Score and sort movies based on preferences and theme
    const scoredMovies = movies.map(movie => ({
      movie,
      score: this.calculateMovieScore(movie, preferences, theme)
    }));

    // Sort by score and return top N movies
    return scoredMovies
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ movie }) => movie);
  }

  private calculateMovieScore(movie: TMDBMovie, preferences: ContentPreferences, theme?: string): number {
    let score = movie.vote_average;

    // Adjust score based on vote count (confidence factor)
    const voteCount = movie.vote_count || 0;
    if (voteCount < 100) score *= 0.8;
    if (voteCount < 50) score *= 0.6;

    const movieGenres = this.getGenreNames(movie.genre_ids || []).map(g => g.toLowerCase());
    const titleAndOverview = `${movie.title} ${movie.overview}`.toLowerCase();

    // Get the current vibe configuration
    const vibeConfig = VIBE_CONFIGS[this.currentVibe];
    if (vibeConfig) {
      // Check for vibe genre matches
      const vibeGenreMatches = vibeConfig.genres.filter(g => 
        movieGenres.includes(g.toLowerCase())
      ).length;
      
      // Boost score based on genre matches
      if (vibeGenreMatches > 0) {
        score *= (1 + (vibeGenreMatches * 0.3));
      }

      // Check for vibe keyword matches
      if (vibeConfig.keywords) {
        const vibeKeywordMatches = vibeConfig.keywords.filter(k =>
          titleAndOverview.includes(k.toLowerCase())
        ).length;
        
        if (vibeKeywordMatches > 0) {
          score *= (1 + (vibeKeywordMatches * 0.2));
        }
      }

      // Year-based adjustments
      const releaseYear = new Date(movie.release_date).getFullYear();
      if (vibeConfig.yearStart && releaseYear < vibeConfig.yearStart) {
        score *= 0.5; // Penalize movies too old
      }
      if (vibeConfig.yearEnd && releaseYear > vibeConfig.yearEnd) {
        score *= 0.5; // Penalize movies too new
      }
    }

    // If a theme is selected (and it's not 'none'), apply theme scoring
    if (theme && theme !== 'none' && THEME_CONFIGS[theme]) {
      const themeConfig = THEME_CONFIGS[theme];
      let themeScore = 0;

      // Check for theme genre matches
      const themeGenreMatches = themeConfig.additionalGenres.filter(g => 
        movieGenres.includes(g.toLowerCase())
      ).length;
      
      themeScore += themeGenreMatches * 0.5;

      // Check for theme keyword matches
      const titleAndOverview = `${movie.title} ${movie.overview}`.toLowerCase();
      const themeKeywordMatches = themeConfig.keywords.filter(k =>
        titleAndOverview.includes(k.toLowerCase())
      ).length;
      
      themeScore += themeKeywordMatches;

      // If we have any theme matches, make them a significant factor
      if (themeScore > 0) {
        score *= (1 + themeScore * 0.4);
      }
    }

    return score;
  }

  // Method to clear all movie caches (useful when preferences change)
  clearMovieCaches(): void {
    cache.clear();
  }
}

// Export a singleton instance
export const movieRecommendations = new MovieRecommendationService(); 