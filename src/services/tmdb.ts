const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'en-US';

// Types for TMDB API responses
export type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  genre_ids: number[];
  original_language: string;
  runtime?: number;
  certification?: string;
}

export type TMDBResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type TMDBGenre = {
  id: number;
  name: string;
}

export type TMDBCertification = {
  certification: string;
  meaning: string;
  order: number;
}

export type MovieFilters = {
  genres?: number[];
  yearStart?: number;
  yearEnd?: number;
  minRating?: number;
  certifications?: string[];
  language?: string;
  keywords?: string[];
};

interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

interface TMDBVideoResponse {
  id: number;
  results: TMDBVideo[];
}

export type TMDBKeyword = {
  id: number;
  name: string;
}

export type TMDBKeywordResponse = {
  id: number;
  keywords: TMDBKeyword[];
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TMDBWatchProviderResult {
  link: string;  // URL to watch page
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
  flatrate?: TMDBWatchProvider[];  // Subscription/Streaming
  free?: TMDBWatchProvider[];
}

class TMDBService {
  private apiKey: string;
  private baseUrl: string;
  private genreCache: Map<number, string>;
  private certificationCache: TMDBCertification[];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = TMDB_BASE_URL;
    this.genreCache = new Map();
    this.certificationCache = [];
  }

  private async fetchFromTMDB<T>(
    endpoint: string, 
    params: Record<string, string | number> = {}
  ): Promise<T> {
    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      language: DEFAULT_LANGUAGE,
      ...params
    });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ TMDB API Authentication failed - API key missing or invalid');
          console.error('🔑 Get a free API key at: https://www.themoviedb.org/settings/api');
          console.error('📁 Add it to .env file as: VITE_TMDB_API_KEY=your_key_here');
        }
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('TMDB API request failed:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      // Load genres
      const genres = await this.getGenres();
      genres.forEach(genre => this.genreCache.set(genre.id, genre.name));

      // Load certifications
      const certifications = await this.getCertifications();
      this.certificationCache = certifications;

      console.log('TMDB Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TMDB Service:', error);
      throw error;
    }
  }

  async getGenres(): Promise<TMDBGenre[]> {
    const response = await this.fetchFromTMDB<{ genres: TMDBGenre[] }>('/genre/movie/list');
    return response.genres;
  }

  async getCertifications(): Promise<TMDBCertification[]> {
    const response = await this.fetchFromTMDB<{ certifications: { US: TMDBCertification[] } }>('/certification/movie/list');
    return response.certifications.US;
  }

  async discoverMovies(filters: MovieFilters = {}, page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const params: Record<string, string | number> = {
      page,
      sort_by: 'vote_average.desc', // Changed from popularity to rating - might include Parent Trap
      'vote_count.gte': 50, // Lowered from 100 to include more classic movies like Parent Trap
    };

    console.log(`🌐 TMDB Discover API call - Page ${page}, Filters:`, filters);

    if (filters.genres?.length) {
      // Use OR logic instead of AND - movie needs ANY of these genres, not ALL
      params.with_genres = filters.genres.join('|'); // Changed from ',' to '|' for OR logic
    }

    if (filters.minRating) {
      params['vote_average.gte'] = filters.minRating;
    }

    if (filters.yearStart) {
      params['primary_release_date.gte'] = `${filters.yearStart}-01-01`;
    }

    if (filters.yearEnd) {
      params['primary_release_date.lte'] = `${filters.yearEnd}-12-31`;
    }

    if (filters.certifications?.length) {
      params.certification_country = 'US';
      params.certification = filters.certifications.join('|');
    }

    if (filters.language) {
      params.with_original_language = filters.language;
    }

    // Add keyword filtering
    if (filters.keywords?.length) {
      // First, search for keyword IDs
      const keywordIds = await Promise.all(
        filters.keywords.map(async keyword => {
          try {
            const response = await this.fetchFromTMDB<{ results: { id: number }[] }>('/search/keyword', { query: keyword });
            return response.results[0]?.id; // Get the first matching keyword ID
          } catch (error) {
            console.warn(`Failed to find keyword ID for "${keyword}":`, error);
            return null;
          }
        })
      );

      // Filter out null values and join IDs
      const validKeywordIds = keywordIds.filter((id): id is number => id !== null);
      if (validKeywordIds.length > 0) {
        params.with_keywords = validKeywordIds.join('|');
      }
    }

    if (page === 1) { // Only log the first page to avoid spam
      console.log(`🔗 TMDB Discover URL params:`, params);
    }
    
    return this.fetchFromTMDB('/discover/movie', params);
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return this.fetchFromTMDB(`/movie/${movieId}`, {
      append_to_response: 'release_dates,keywords'
    });
  }

  async searchMoviesByTitle(title: string): Promise<TMDBResponse<TMDBMovie>> {
    return this.fetchFromTMDB('/search/movie', { query: title });
  }

  async getMovieCertification(movieId: number): Promise<string | null> {
    const response = await this.fetchFromTMDB<{
      results: Array<{
        iso_3166_1: string;
        release_dates: Array<{
          certification: string;
          type: number;
        }>;
      }>;
    }>(`/movie/${movieId}/release_dates`);

    // Find US certification
    const usRelease = response.results.find(r => r.iso_3166_1 === 'US');
    if (!usRelease) return null;
    
    // Get the theatrical release certification (type 3) or the first available
    const certificationInfo = usRelease.release_dates.find(r => r.type === 3) 
      || usRelease.release_dates[0];
    
    return certificationInfo?.certification || null;
  }

  async getMovieKeywords(movieId: number): Promise<TMDBKeywordResponse> {
    return this.fetchFromTMDB<TMDBKeywordResponse>(`/movie/${movieId}/keywords`);
  }

  async getMovieReleaseDates(movieId: number): Promise<{
    id: number;
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
        type: number;
      }>;
    }>;
  }> {
    return this.fetchFromTMDB(`/movie/${movieId}/release_dates`);
  }

  async getMovieVideos(movieId: number): Promise<TMDBVideoResponse> {
    const response = await this.fetchFromTMDB<TMDBVideoResponse>(`/movie/${movieId}/videos`, {
      api_key: this.apiKey,
      language: DEFAULT_LANGUAGE
    });
    return response;
  }

  async getWatchProviders(movieId: number): Promise<TMDBWatchProviderResult | null> {
    try {
      const response = await this.fetchFromTMDB<{
        results: { [countryCode: string]: TMDBWatchProviderResult }
      }>(`/movie/${movieId}/watch/providers`);

      // Get US providers
      const usProviders = response.results['US'];
      if (!usProviders) return null;

      return {
        link: usProviders.link,
        rent: usProviders.rent || [],
        buy: usProviders.buy || [],
        flatrate: usProviders.flatrate || [],
        free: usProviders.free || []
      };
    } catch (error) {
      console.error('Error fetching watch providers:', error);
      return null;
    }
  }

  async getSimilarMovies(movieId: number, limit: number = 4): Promise<TMDBMovie[]> {
    try {
      const response = await this.fetchFromTMDB<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/similar`, {
        page: 1
      });

      // Filter out movies with low vote counts and sort by vote average
      return response.results
        .filter(movie => (movie.vote_count || 0) >= 100)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      return [];
    }
  }

  // Helper method to get the best available trailer
  getBestTrailer(videos: TMDBVideo[]): TMDBVideo | null {
    // First try to find an official trailer from YouTube
    const officialTrailer = videos.find(
      v => v.type === 'Trailer' && v.official && v.site === 'YouTube'
    );
    if (officialTrailer) return officialTrailer;

    // Then any trailer from YouTube
    const youtubeTrailer = videos.find(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    );
    if (youtubeTrailer) return youtubeTrailer;

    // Finally, any YouTube video
    const youtubeVideo = videos.find(v => v.site === 'YouTube');
    return youtubeVideo || null;
  }

  // Helper method to get full image URLs
  getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  // Helper to get genre names from IDs
  getGenreNames(genreIds: number[]): string[] {
    return genreIds
      .map(id => this.genreCache.get(id))
      .filter((name): name is string => name !== undefined);
  }

  // Helper to check if a certification is appropriate for an age group
  isCertificationAppropriate(certification: string, ageGroup: string): boolean {
    const certInfo = this.certificationCache.find(c => c.certification === certification);
    if (!certInfo) return false;

    // Map certification to minimum age group
    const certToAgeGroup: Record<string, string[]> = {
      'G': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
      'PG': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
      'PG-13': ['tweens', 'teens', 'adults'],
      'R': ['adults'],
      'NC-17': ['adults']
    };

    return certToAgeGroup[certification]?.includes(ageGroup) ?? false;
  }
}

// Create and export a singleton instance
const apiKey = import.meta.env.VITE_TMDB_API_KEY;
if (!apiKey) {
  console.error('❌ TMDB API key not found! Set VITE_TMDB_API_KEY in .env file');
  console.error('Get a free API key at: https://www.themoviedb.org/settings/api');
} else {
  console.log('✅ TMDB API key found, initializing service...');
}

export const tmdbService = new TMDBService(apiKey || 'dummy-key');

// Initialize the service
tmdbService.initialize().catch(console.error); 