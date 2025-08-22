import { tmdbService } from './tmdb';

export interface ContentWarning {
  violence: number;          // 0-5 scale
  language: number;          // 0-5 scale
  sexualContent: number;     // 0-5 scale
  substances: number;        // 0-5 scale
  productPlacement: number;  // 0-5 scale
}

class ContentWarningService {
  // Keywords that indicate different types of content
  private readonly VIOLENCE_KEYWORDS = {
    mild: ['action', 'fight scene', 'martial arts', 'battle'],
    moderate: ['violence', 'fighting', 'combat', 'weapon', 'injury'],
    strong: ['blood', 'death', 'killing', 'gun', 'shooting'],
    severe: ['murder', 'gore', 'graphic violence', 'brutal', 'torture']
  };

  private readonly LANGUAGE_KEYWORDS = {
    mild: ['mild language', 'rude humor'],
    moderate: ['language', 'cursing', 'profanity'],
    strong: ['strong language', 'crude humor', 'vulgar'],
    severe: ['explicit language', 'offensive language', 'profane']
  };

  private readonly SEXUAL_CONTENT_KEYWORDS = {
    mild: ['romance', 'kissing', 'flirting'],
    moderate: ['sensuality', 'suggestive content', 'romantic scene'],
    strong: ['sexual content', 'sexuality', 'sexual reference'],
    severe: ['nudity', 'sexual situation', 'erotic', 'sex scene']
  };

  private readonly SUBSTANCE_KEYWORDS = {
    mild: ['drinking', 'bar scene', 'tobacco'],
    moderate: ['alcohol', 'smoking', 'drunk'],
    strong: ['drug reference', 'substance use', 'intoxication'],
    severe: ['drugs', 'substance abuse', 'addiction', 'alcoholism']
  };

  private readonly PRODUCT_PLACEMENT_KEYWORDS = {
    mild: ['brand', 'logo'],
    moderate: ['advertising', 'promotional'],
    strong: ['product placement', 'branded content'],
    severe: ['commercial', 'marketing campaign']
  };

  async getContentWarnings(movieId: number): Promise<ContentWarning> {
    try {
      const [movieDetails, keywordsResponse] = await Promise.all([
        tmdbService.getMovieDetails(movieId),
        tmdbService.getMovieKeywords(movieId)
      ]);

      // Get keywords and prepare overview text
      const keywords = keywordsResponse.keywords.map(k => k.name.toLowerCase());
      const overview = movieDetails.overview.toLowerCase();
      
      return {
        violence: this.calculateScore(keywords, overview, this.VIOLENCE_KEYWORDS),
        language: this.calculateScore(keywords, overview, this.LANGUAGE_KEYWORDS),
        sexualContent: this.calculateScore(keywords, overview, this.SEXUAL_CONTENT_KEYWORDS),
        substances: this.calculateScore(keywords, overview, this.SUBSTANCE_KEYWORDS),
        productPlacement: this.calculateScore(keywords, overview, this.PRODUCT_PLACEMENT_KEYWORDS),
      };
    } catch (error) {
      console.error('Error getting content warnings:', error);
      return {
        violence: 0,
        language: 0,
        sexualContent: 0,
        substances: 0,
        productPlacement: 0,
      };
    }
  }

  private calculateScore(
    keywords: string[],
    overview: string,
    contentKeywords: { [severity: string]: string[] }
  ): number {
    // Check for keyword matches at each severity level
    if (this.hasMatch(keywords, contentKeywords.severe) || 
        this.hasMatchInText(overview, contentKeywords.severe)) {
      return 5;
    }
    if (this.hasMatch(keywords, contentKeywords.strong) || 
        this.hasMatchInText(overview, contentKeywords.strong)) {
      return 4;
    }
    if (this.hasMatch(keywords, contentKeywords.moderate) || 
        this.hasMatchInText(overview, contentKeywords.moderate)) {
      return 3;
    }
    if (this.hasMatch(keywords, contentKeywords.mild) || 
        this.hasMatchInText(overview, contentKeywords.mild)) {
      return 2;
    }
    return 0;
  }

  private hasMatch(keywords: string[], contentKeywords: string[]): boolean {
    return keywords.some(keyword => 
      contentKeywords.some(contentKeyword => 
        keyword.includes(contentKeyword) || contentKeyword.includes(keyword)
      )
    );
  }

  private hasMatchInText(text: string, contentKeywords: string[]): boolean {
    return contentKeywords.some(keyword => text.includes(keyword));
  }
}

export const contentWarningService = new ContentWarningService(); 