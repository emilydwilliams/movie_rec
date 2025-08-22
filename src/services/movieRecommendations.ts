import { tmdbService, type TMDBMovie, type MovieFilters, type TMDBGenre } from './tmdb';
import { cache, CacheService } from './cache';
import { sentimentAnalysis } from './sentimentAnalysis';
import type { VibeType as SentimentVibeType, ThemeType } from '../types/sentiment';

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
    genres: ['family', 'comedy', 'adventure', 'animation', 'romance'],
    yearStart: 1980,
    yearEnd: 2010,
    minRating: 5.0, // Further lowered to be more inclusive
    preferredCertifications: ['G', 'PG', 'PG-13'],
    keywords: ['90s', '80s', 'childhood', 'retro', 'nostalgia']
  }
};

// Musical keywords are handled in the VIBE_CONFIGS

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
    keywords: ['christmas', 'santa', 'santa claus', 'xmas', 'noel'],
    additionalGenres: [] // No additional genres - rely on content matching only
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
    
    // Special handling for artistic animation vibe - ONLY animation genre
    if (vibe === 'artsy') {
      genres = ['animation']; // Force only animation genre for artistic vibe
      // Clear cache for artistic vibe to ensure fresh results
      cache.clear();
    }
    
    // Clear cache for Christmas theme to ensure updated keywords take effect
    if (theme === 'christmas') {
      cache.clear();
    }
    
    // Clear cache when any theme is selected to ensure strict filtering
    if (theme && theme !== 'none') {
      cache.clear();
    }
    
    const genreIds = this.getGenreIds(genres);
    
    // Get allowed certifications based on age groups
    const allowedCertifications = this.getCertificationsForAgeGroups(ageGroups);
    
    // Intersect with vibe's preferred certifications
    const certifications = config.preferredCertifications.filter(
      cert => allowedCertifications.includes(cert)
    );

    // Only use vibe-specific keywords in TMDB query, not theme keywords
    // Theme keywords will be applied during sentiment analysis for better results
    const keywords = vibe === 'musical' 
      ? (config as typeof VIBE_CONFIGS['musical']).keywords
      : undefined;

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
      // Fetch many more pages to find movies like The Parent Trap that might not be in top results
      const pagesToFetch = 100; // Get 100 pages = ~2,000 movies for comprehensive search
      console.log(`Starting comprehensive search: fetching ${pagesToFetch} pages for vibe: ${vibe}, theme: ${theme || 'none'}`);
      console.log(`Search filters:`, {
        genres: genres,
        genreIds: genreIds,
        yearStart: config.yearStart,
        yearEnd: config.yearEnd,
        minRating: config.minRating,
        certifications: certifications,
        voteCountThreshold: 50
      });
      

      
      // Fetch pages in batches to avoid overwhelming the API
      const batchSize = 5; // Smaller batches for better error handling
      const allMovies: TMDBMovie[] = [];
      
      for (let batch = 0; batch < Math.ceil(pagesToFetch / batchSize); batch++) {
        const startPage = batch * batchSize + 1;
        const endPage = Math.min((batch + 1) * batchSize, pagesToFetch);
        
              console.log(`Fetching batch ${batch + 1}/${Math.ceil(pagesToFetch / batchSize)}: pages ${startPage}-${endPage} (${allMovies.length} movies so far)`);
      
      const batchPromises = Array.from({ length: endPage - startPage + 1 }, (_, i) => 
        tmdbService.discoverMovies(filters, startPage + i)
      );
      
      try {
        const batchResponses = await Promise.all(batchPromises);
        const batchMovies = batchResponses.flatMap(response => response.results);
        allMovies.push(...batchMovies);
        

          
          // Small delay between batches to be respectful to TMDB API
          if (batch < Math.ceil(pagesToFetch / batchSize) - 1) {
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        } catch (batchError) {
          console.warn(`Failed to fetch batch ${batch + 1}:`, batchError);
          // Continue with other batches even if one fails
        }
      }
      
      console.log(`Comprehensive search complete: fetched ${allMovies.length} movies from ${pagesToFetch} pages for vibe: ${vibe}, theme: ${theme || 'none'}`);
      

      
      // Cache the results
      cache.set(cacheKey, allMovies, this.MOVIE_CACHE_TTL);
      
      return allMovies;
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
    console.log(`🎬 getRecommendations called with vibe: ${vibe}, theme: ${theme || 'none'}, ageGroups: ${ageGroups.join(',')}`);
    
    // Set the current vibe for scoring
    this.currentVibe = vibe;

    // Wait for genre map to be initialized if it hasn't been
    if (this.genreIdMap.size === 0) {
      console.log('⚠️ Genre map not initialized, initializing now...');
      await this.initializeGenreMap();
    } else {
      console.log(`✅ Genre map initialized with ${this.genreIdMap.size} genres`);
    }

    const movies = await this.getMoviesForVibe(vibe, ageGroups, preferences, theme);
    
    console.log(`📊 Retrieved ${movies.length} movies from getMoviesForVibe`);
    
    if (movies.length === 0) {
      console.log('❌ No movies found - check TMDB API filters or API key');
      return [];
    }
    
    // Score movies with sentiment analysis integration
    console.log(`Starting sentiment analysis for ${movies.length} movies with vibe: ${vibe}, theme: ${theme || 'none'}`);
    
    const scoredMovies = await Promise.all(
      movies.map(async (movie) => {
        const score = await this.calculateMovieScoreWithSentiment(
          movie, 
          preferences, 
          vibe as SentimentVibeType, 
          (theme || 'none') as ThemeType
        );
        

        
        return { movie, score };
      })
    );

    if (scoredMovies.length > 0) {
      console.log(`Scored movies range: ${Math.min(...scoredMovies.map(m => m.score)).toFixed(2)} - ${Math.max(...scoredMovies.map(m => m.score)).toFixed(2)}`);
    }

    // Filter out movies with zero scores (theme mismatches) and sort by score
    const finalResults = scoredMovies
      .filter(({ score }) => score > 0) // Remove movies that don't match the theme
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    

    
    return finalResults.map(({ movie }) => movie);
  }

  private async calculateMovieScoreWithSentiment(
    movie: TMDBMovie, 
    preferences: ContentPreferences, 
    vibe: SentimentVibeType, 
    theme: ThemeType
  ): Promise<number> {
    try {
      // Start with base movie score (traditional scoring)
      const baseScore = this.calculateMovieScore(movie, preferences, theme === 'none' ? undefined : theme);
      
      // Apply sentiment analysis enhancement
      if (movie.overview) {
        const movieSentiment = await sentimentAnalysis.analyzeMovie(
          movie.overview, 
          vibe, 
          theme
        );
        
        // Calculate enhanced score with sentiment analysis heavily weighted
        return sentimentAnalysis.calculateSentimentScore(movieSentiment, baseScore);
      }
      
      // Fallback to traditional scoring if no overview
      return baseScore;
      
    } catch (error) {
      console.warn('Sentiment analysis failed for movie:', movie.title, error);
      // Fallback to traditional scoring
      return this.calculateMovieScore(movie, preferences, theme === 'none' ? undefined : theme);
    }
  }

  private calculateMovieScore(movie: TMDBMovie, _preferences: ContentPreferences, theme?: string): number {
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
    console.log('🧹 Movie cache cleared - next search will fetch fresh results');
  }
}

// Export a singleton instance
export const movieRecommendations = new MovieRecommendationService();

// Add to global scope for debugging
if (typeof window !== 'undefined') {
  (window as any).clearMovieCache = () => {
    movieRecommendations.clearMovieCaches();
    console.log('🧹 Cache cleared! Next search will be fresh.');
  };
  (window as any).testParentTrap = async () => {
    console.log('🔍 Testing Parent Trap search directly...');
    try {
      const results = await tmdbService.searchMoviesByTitle('The Parent Trap');
      console.log('Parent Trap search results:', results);
    } catch (error) {
      console.error('Parent Trap search failed:', error);
    }
  };
  (window as any).testHalloween = async () => {
    console.log('🎃 Testing Halloween theme search...');
    try {
      const results = await tmdbService.searchMoviesByTitle('Hocus Pocus');
      console.log('Hocus Pocus search results:', results);
      if (results.results.length > 0) {
        const movie = results.results[0];
        console.log('Testing Halloween theme alignment for Hocus Pocus:', {
          overview: movie.overview?.substring(0, 100) + '...',
          title: movie.title
        });
      }
    } catch (error) {
      console.error('Halloween test failed:', error);
    }
  };
  console.log('🛠️ Debug helpers available:');
  console.log('   clearMovieCache() - Force refresh movie search');
  console.log('   testParentTrap() - Test TMDB search directly');
  console.log('   testHalloween() - Test Halloween theme detection');
} 