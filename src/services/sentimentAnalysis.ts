// Sentiment Analysis Service using Hugging Face Inference API

import type { SentimentResponse, HuggingFaceResponse, MovieSentiment, VibeType, ThemeType } from '../types/sentiment';
import { VIBE_KEYWORDS, THEME_KEYWORDS, calculateVibeAlignment, calculateThemeAlignment } from '../utils/sentimentMapping';

class SentimentAnalysisService {
  private readonly API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';
  private readonly TIMEOUT = 10000; // 10 seconds
  
  /**
   * Analyze sentiment of text using keyword-based analysis (fallback approach)
   */
  async analyzeSentiment(text: string): Promise<SentimentResponse> {
    if (!text || text.trim().length === 0) {
      return { label: 'NEUTRAL', score: 0.5 };
    }

    // Use local keyword-based sentiment analysis as fallback
    return this.analyzeKeywordBasedSentiment(text);
  }

  /**
   * Simple keyword-based sentiment analysis
   */
  private analyzeKeywordBasedSentiment(text: string): SentimentResponse {
    const lowerText = text.toLowerCase();
    
    const positiveWords = [
      'amazing', 'awesome', 'beautiful', 'brilliant', 'charming', 'delightful', 
      'excellent', 'fantastic', 'fun', 'funny', 'great', 'heartwarming', 
      'hilarious', 'incredible', 'inspiring', 'joyful', 'lovely', 'magical', 
      'outstanding', 'perfect', 'spectacular', 'stunning', 'sweet', 'touching', 
      'thrilling', 'uplifting', 'wonderful', 'exciting', 'entertaining', 
      'enjoyable', 'captivating', 'engaging', 'enchanting', 'cheerful'
    ];
    
    const negativeWords = [
      'awful', 'bad', 'boring', 'terrible', 'horrible', 'disappointing', 
      'depressing', 'sad', 'tragic', 'dark', 'disturbing', 'frightening', 
      'scary', 'violent', 'cruel', 'harsh', 'bitter', 'grim', 'bleak', 
      'dreary', 'dull', 'lifeless', 'monotonous', 'tedious', 'unpleasant', 
      'annoying', 'frustrating', 'confusing', 'ridiculous', 'stupid'
    ];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Count positive words
    for (const word of positiveWords) {
      const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
      positiveScore += matches;
    }
    
    // Count negative words
    for (const word of negativeWords) {
      const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
      negativeScore += matches;
    }
    
    // Determine sentiment
    const totalWords = positiveScore + negativeScore;
    
    if (totalWords === 0) {
      return { label: 'NEUTRAL', score: 0.7 };
    }
    
    const positiveRatio = positiveScore / totalWords;
    
    if (positiveRatio > 0.6) {
      return { label: 'POSITIVE', score: Math.min(0.6 + (positiveRatio * 0.4), 1.0) };
    } else if (positiveRatio < 0.4) {
      return { label: 'NEGATIVE', score: Math.min(0.6 + ((1 - positiveRatio) * 0.4), 1.0) };
    } else {
      return { label: 'NEUTRAL', score: 0.7 };
    }
  }

  /**
   * Map Hugging Face sentiment labels to our standard format
   */
  private mapSentimentLabel(label: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    const normalized = label.toLowerCase();
    
    if (normalized.includes('positive') || normalized.includes('label_2')) {
      return 'POSITIVE';
    } else if (normalized.includes('negative') || normalized.includes('label_0')) {
      return 'NEGATIVE';
    } else {
      return 'NEUTRAL';
    }
  }

  /**
   * Analyze movie sentiment and calculate vibe/theme alignment
   */
  async analyzeMovie(
    movieOverview: string, 
    selectedVibe: VibeType, 
    selectedTheme: ThemeType
  ): Promise<MovieSentiment> {
    // Get sentiment analysis
    const overviewSentiment = await this.analyzeSentiment(movieOverview);
    
    // Calculate vibe alignment using emotional keywords
    const vibeKeywords = VIBE_KEYWORDS[selectedVibe] || [];
    const vibeAlignment = calculateVibeAlignment(movieOverview, vibeKeywords);
    
    // Calculate theme alignment using content keywords
    const themeKeywords = selectedTheme === 'none' ? [] : (THEME_KEYWORDS[selectedTheme] || []);
    const themeAlignment = selectedTheme === 'none' ? 1.0 : calculateThemeAlignment(movieOverview, themeKeywords);
    
    // Special handling for artistic animation vibe - must be animated
    let finalVibeAlignment = vibeAlignment;
    if (selectedVibe === 'artsy') {
      const animationKeywords = ['animation', 'animated', 'cartoon', 'anime', 'stop motion', 'claymation', 'computer-animated', 'hand-drawn'];
      const hasAnimationWords = animationKeywords.some(word => movieOverview.toLowerCase().includes(word));
      
      if (!hasAnimationWords) {
        finalVibeAlignment = 0; // Non-animated movies get zero vibe alignment for artistic animation
      }
    }

    return {
      overview: overviewSentiment,
      vibeAlignment: finalVibeAlignment,
      themeAlignment
    };
  }

  /**
   * Calculate overall sentiment score for movie recommendation
   * This combines sentiment analysis with vibe/theme matching
   */
  calculateSentimentScore(
    movieSentiment: MovieSentiment,
    baseScore: number = 1.0
  ): number {
    // Base sentiment modifier (more conservative)
    let sentimentMultiplier = 1.0;
    
    switch (movieSentiment.overview.label) {
      case 'POSITIVE':
        sentimentMultiplier = 1.0 + (movieSentiment.overview.score * 0.1);
        break;
      case 'NEGATIVE':
        sentimentMultiplier = 1.0 - (movieSentiment.overview.score * 0.05);
        break;
      case 'NEUTRAL':
        sentimentMultiplier = 1.0;
        break;
    }
    
    // HARD FILTER: If theme alignment is 0, movie should not appear at all
    if (movieSentiment.themeAlignment === 0.0) {
      return 0; // Completely eliminate movies that don't match the theme
    }
    
    // Restore higher weights now that we have a larger movie pool
    // Vibe alignment bonus (40% max influence)
    const vibeMultiplier = 1.0 + (movieSentiment.vibeAlignment * 0.4);
    
    // Theme alignment bonus (50% max influence - themes are very important)
    const themeMultiplier = 1.0 + (movieSentiment.themeAlignment * 0.5);
    
    // Combine all factors
    return baseScore * sentimentMultiplier * vibeMultiplier * themeMultiplier;
  }
}

// Export singleton instance
export const sentimentAnalysis = new SentimentAnalysisService();
