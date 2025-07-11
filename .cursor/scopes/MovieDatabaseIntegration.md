# Movie Database Integration Spec

## Purpose & User Problem
To provide personalized movie recommendations that match the family's preferences and age requirements while ensuring content is appropriate and enjoyable for all viewers.

## Success Criteria
1. Movies recommended match the selected vibe theme
2. Content warnings accurately reflect family preferences
3. Age-appropriate recommendations for all family members
4. Fast and responsive movie information loading
5. Graceful handling of API failures

## Technical Scope

### 1. Content Filtering Logic
- Filter movies based on:
  - Age appropriateness (using MPAA ratings)
  - Content preferences (violence, language, etc.)
  - Selected vibe/theme
  - Language preferences
  - Release date ranges

### 2. Movie Recommendation Algorithm
- Scoring system based on:
  - Match with selected vibe (genre mapping)
  - Family age range compatibility
  - Content preference alignment
  - User rating threshold (>= 7.0 for high quality)
  - Release date relevance
- Weighted scoring to prioritize:
  1. Age appropriateness (highest weight)
  2. Content preferences
  3. Vibe match
  4. Rating/popularity

### 3. Caching Layer
- Implementation:
  - Use browser localStorage for client-side caching
  - Cache movie details and images
  - Cache MPAA ratings and content warnings
- Cache management:
  - TTL (Time To Live): 24 hours
  - Cache invalidation on vibe/preferences change
  - Separate caches for different data types

### 4. API Integration Enhancements
- Error handling:
  - Retry logic for failed requests
  - Fallback recommendations
  - User-friendly error messages
- Rate limiting:
  - Request throttling
  - Queue system for batch requests
- Performance optimization:
  - Parallel requests where possible
  - Preloading next page of results
  - Image optimization

## Technical Considerations

### Data Models
```typescript
interface MovieScore {
  movieId: number;
  totalScore: number;
  ageScore: number;
  vibeScore: number;
  contentScore: number;
  ratingScore: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ContentWarnings {
  violence: number;
  language: number;
  substances: number;
  sexuality: number;
  grief: number;
  productPlacement: number;
}
```

### Vibe to Genre Mapping
```typescript
const VIBE_GENRES = {
  cozy: ['family', 'fantasy'],
  silly: ['comedy', 'family'],
  adventure: ['adventure', 'action', 'sci-fi'],
  artsy: ['animation', 'drama', 'foreign'],
  musical: ['musical'],
  classic: {
    genres: ['classic', 'family', 'comedy'],
    yearEnd: 1980
  },
  millennial: {
    genres: ['family', 'comedy', 'adventure'],
    yearStart: 1980,
    yearEnd: 2010
  }
};
```

### MPAA Rating to Age Group Mapping
```typescript
const RATING_AGE_GROUPS = {
  'G': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
  'PG': ['preschool', 'elementary', 'tweens', 'teens', 'adults'],
  'PG-13': ['tweens', 'teens', 'adults'],
  'R': ['adults']
};
```

## Implementation Plan

1. Content Filtering
   - Implement rating filters
   - Add content warning detection
   - Create vibe-genre mapper
   - Build age group validator

2. Recommendation Algorithm
   - Create scoring system
   - Implement weighting logic
   - Add sorting and ranking
   - Build results processor

3. Caching System
   - Set up localStorage wrapper
   - Implement cache management
   - Add invalidation logic
   - Create preloader

4. Testing & Optimization
   - Unit tests for filters
   - Integration tests
   - Performance testing
   - Error handling tests

## Out of Scope
- Machine learning-based recommendations
- User accounts/preferences storage
- Social features (sharing, reviews)
- Advanced parental controls
- Custom content warnings 