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
};

const VIBE_CONFIGS: Record<VibeType, VibeConfig> = {
  cozy: {
    genres: ['family', 'fantasy'],
    minRating: 7.0,
    preferredCertifications: ['G', 'PG']
  },
  silly: {
    genres: ['comedy', 'family'],
    minRating: 6.5,
    preferredCertifications: ['G', 'PG']
  },
  adventure: {
    genres: ['adventure', 'action', 'sci-fi'],
    minRating: 7.0,
    preferredCertifications: ['PG', 'PG-13']
  },
  artsy: {
    genres: ['animation', 'drama', 'foreign'],
    minRating: 7.5,
    preferredCertifications: ['G', 'PG', 'PG-13']
  },
  musical: {
    genres: ['musical'],
    minRating: 7.0,
    preferredCertifications: ['G', 'PG']
  },
  classic: {
    genres: ['classic', 'family', 'comedy'],
    yearEnd: 1980,
    minRating: 7.5,
    preferredCertifications: ['G', 'PG']
  },
  millennial: {
    genres: ['family', 'comedy', 'adventure'],
    yearStart: 1980,
    yearEnd: 2010,
    minRating: 6.5,
    preferredCertifications: ['G', 'PG', 'PG-13']
  }
};

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
    const certificationMap: Record<string, AgeGroup[]> = {
      'G': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
      'PG': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
      'PG-13': ['tweens', 'teens', 'adults'],
      'R': ['adults']
    };

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

    const filters: MovieFilters = {
      genres: genreIds,
      yearStart: config.yearStart,
      yearEnd: config.yearEnd,
      minRating: config.minRating,
      certifications,
      language: 'en',
      keywords: theme && theme !== 'none' ? THEME_CONFIGS[theme]?.keywords : undefined
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

    // If a theme is selected (and it's not 'none'), make it the primary factor
    if (theme && theme !== 'none' && THEME_CONFIGS[theme]) {
      const themeConfig = THEME_CONFIGS[theme];
      let themeScore = 0;

      // Check for theme genre matches
      const movieGenres = this.getGenreNames(movie.genre_ids || []).map(g => g.toLowerCase());
      const themeGenreMatches = themeConfig.additionalGenres.filter(g => 
        movieGenres.includes(g.toLowerCase())
      ).length;
      
      // Add points for genre matches (0.5 points per match)
      themeScore += themeGenreMatches * 0.5;

      // Check for theme keyword matches
      const keywords = movie.keywords?.keywords || [];
      const keywordMatches = keywords.filter(k => 
        themeConfig.keywords.some(tk => k.name.toLowerCase().includes(tk.toLowerCase()))
      ).length;
      
      // Add points for keyword matches (1 point per match)
      themeScore += keywordMatches;

      // Check title and overview for theme keywords
      const titleAndOverview = `${movie.title} ${movie.overview}`.toLowerCase();
      const textKeywordMatches = themeConfig.keywords.filter(k =>
        titleAndOverview.includes(k.toLowerCase())
      ).length;
      
      // Add points for title/overview matches (0.3 points per match)
      themeScore += textKeywordMatches * 0.3;

      // If we have any theme matches, make them the primary factor
      if (themeScore > 0) {
        // Base score becomes 5 + theme score (max ~10)
        // Then multiply by the normalized rating factor (0.5-1.0)
        score = (5 + themeScore) * (0.5 + (movie.vote_average / 20));
      } else {
        // If no theme matches, severely penalize the score
        score *= 0.2;
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