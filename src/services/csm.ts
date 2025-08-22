import { cache } from './cache';

export interface CSMContentRating {
  violence: number;          // 0-5 scale
  language: number;          // 0-5 scale
  sexualContent: number;     // 0-5 scale
  substances: number;        // 0-5 scale
  productPlacement: number;  // 0-5 scale
}

export interface CSMMovieDetails extends CSMContentRating {
  csm_id: string;
  title: string;
  year: number;
  description: string;
}

class CSMService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.commonsensemedia.org/v1';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    const apiKey = import.meta.env.VITE_CSM_API_KEY;
    if (!apiKey) {
      throw new Error('Common Sense Media API key not found in environment variables');
    }
    this.API_KEY = apiKey;
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
      }
    }
    throw new Error('Max retries reached');
  }

  async getMovieDetails(title: string, year?: number): Promise<CSMMovieDetails | null> {
    const cacheKey = `csm_movie_${title}_${year || ''}`;
    const cached = await cache.get<CSMMovieDetails>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const searchParams = new URLSearchParams({
        title,
        ...(year && { year: year.toString() }),
        type: 'movie',
      });

      const response = await this.fetchWithRetry(
        `${this.BASE_URL}/search?${searchParams.toString()}`
      );

      const data = await response.json();
      
      if (!data.results?.length) {
        return null;
      }

      const movieId = data.results[0].id;
      const detailsResponse = await this.fetchWithRetry(
        `${this.BASE_URL}/movies/${movieId}`
      );

      const movieDetails = await detailsResponse.json();
      
      const transformedData: CSMMovieDetails = this.transformAPIResponse(movieDetails);
      
      await cache.set(cacheKey, transformedData, this.CACHE_TTL);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching CSM movie details:', error);
      return null;
    }
  }

  private transformAPIResponse(apiData: any): CSMMovieDetails {
    return {
      csm_id: apiData.id,
      title: apiData.title,
      year: apiData.year,
      description: apiData.description,
      violence: apiData.ratings?.violence || 0,
      language: apiData.ratings?.language || 0,
      sexualContent: apiData.ratings?.sex || 0,
      substances: apiData.ratings?.substances || 0,
      productPlacement: apiData.ratings?.product_placement || 0,
    };
  }
}

export const csmService = new CSMService(); 