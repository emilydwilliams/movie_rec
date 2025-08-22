// Sentiment analysis types for movie recommendation enhancement

export interface SentimentResponse {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number; // confidence 0-1
}

export interface HuggingFaceResponse {
  label: string;
  score: number;
}

export interface MovieSentiment {
  overview: SentimentResponse;
  vibeAlignment: number; // 0-1 match score
  themeAlignment: number; // 0-1 match score
}

export type VibeType = 'cozy' | 'silly' | 'adventure' | 'artsy' | 'musical' | 'classic' | 'millennial';
export type ThemeType = 'animals' | 'sports' | 'summer' | 'halloween' | 'christmas' | 'winter' | 'none';

export interface VibeKeywords {
  [key: string]: string[];
}

export interface ThemeKeywords {
  [key: string]: string[];
}
