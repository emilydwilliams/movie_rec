type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

export class CacheService {
  private prefix: string;
  private defaultTTL: number;

  constructor(prefix: string = 'movieRec_', defaultTTL: number = 24 * 60 * 60 * 1000) {
    this.prefix = prefix;
    this.defaultTTL = defaultTTL; // Default 24 hours in milliseconds
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
      this.clearExpired(); // Try to free up space by clearing expired entries
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if entry has expired
      if (Date.now() > entry.expiresAt) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry: CacheEntry<unknown> = JSON.parse(item);
              if (now > entry.expiresAt) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // If entry is corrupted, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache entries:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Helper to generate cache keys
  static generateKey(parts: (string | number | boolean)[]): string {
    return parts.join('_');
  }
}

// Export a singleton instance
export const cache = new CacheService(); 