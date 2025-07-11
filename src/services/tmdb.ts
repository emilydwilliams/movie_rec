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
      sort_by: 'popularity.desc',
      'vote_count.gte': 100, // Ensure sufficient ratings
    };

    if (filters.genres?.length) {
      params.with_genres = filters.genres.join(',');
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

    return this.fetchFromTMDB('/discover/movie', params);
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return this.fetchFromTMDB(`/movie/${movieId}`, {
      append_to_response: 'release_dates,keywords'
    });
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
export const tmdbService = new TMDBService(import.meta.env.VITE_TMDB_API_KEY);

// Initialize the service
tmdbService.initialize().catch(console.error); 