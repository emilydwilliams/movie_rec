# Sentiment Analysis Enhancement Spec

## Overview
Enhance the movie recommendation system by integrating sentiment analysis to better match user-selected 'vibes' and 'themes' with movie content, making these factors the most heavily weighted components of the recommendation algorithm.

## Problem Statement
Currently, the recommendation system relies primarily on genre matching, keywords, and ratings. While effective, it doesn't capture the emotional tone and sentiment of movies, which is crucial for matching user 'vibes' and 'themes'. Users want recommendations that match not just what a movie is about, but how it feels.

## Goals
1. Integrate real-time sentiment analysis of movie overviews
2. Create sentiment categories that map to existing vibes and themes
3. Make vibe/theme sentiment matching the primary recommendation factor (60-70% weight)
4. Lay groundwork for future integration of user review sentiment analysis

## Current State

### Existing Vibes
- `cozy` - Cozy and Magical 🍄
- `silly` - Silly and Sweet 🧁  
- `adventure` - Adventure Time 🚀
- `artsy` - Artistic Animation 🎨
- `musical` - Musical Fun 🎶
- `classic` - True Classic 🎬
- `millennial` - Millennial Childhood 📼

### Existing Themes
- `animals` - Animal Friends
- `sports` - Sports
- `summer` - Summer Fun
- `halloween` - Halloween
- `christmas` - Christmas
- `winter` - Snow Day
- `none` - No Theme

### Current Recommendation Scoring
Located in `src/services/movieRecommendations.ts`:
- Base score: movie.vote_average
- Genre matching: +30% per match
- Keyword matching: +20% per match
- Vote count confidence factor
- Year-based adjustments

## Proposed Solution

### Phase 1: Sentiment Analysis Service Integration

**Service Selection:** Hugging Face Inference API
- **Model:** `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Rationale:** Free tier, excellent accuracy, easy JavaScript integration
- **API Response:** Returns sentiment labels (POSITIVE, NEGATIVE, NEUTRAL) with confidence scores

**Implementation:**
1. Create new service: `src/services/sentimentAnalysis.ts`
2. Integrate with existing movie recommendation flow
3. Real-time API calls for movie overviews during recommendation generation

### Phase 2: Vibe Sentiment Mapping & Theme Content Matching

**Two-Pronged Approach:**
1. **Vibes** = Emotional sentiment matching using descriptive keywords
2. **Themes** = Content matching using specific subject matter keywords

**Vibes - Sentiment Keywords (Emotional):**
- `cozy` - ['warm', 'cozy', 'magical', 'enchanting', 'heartwarming', 'comforting']
- `silly` - ['playful', 'lighthearted', 'innocent', 'funny', 'cheerful', 'whimsical']
- `adventure` - ['exciting', 'thrilling', 'bold', 'epic', 'energetic', 'heroic']
- `artsy` - ['beautiful', 'contemplative', 'creative', 'unique', 'thoughtful', 'inspiring']
- `musical` - ['upbeat', 'joyful', 'energetic', 'celebratory', 'rhythmic', 'lively']
- `classic` - ['timeless', 'nostalgic', 'enduring']
- `millennial` - ['nostalgic', 'familiar', 'comforting', 'fun', 'reminiscent', 'cherished']

**Themes - Content Keywords (Subject Matter):**
- `animals` - ['animal', 'dog', 'cat', 'panda', 'wildlife', 'pet', 'creature', 'beast', etc.]
- `sports` - ['sport', 'sports', 'baseball', 'football', 'basketball', 'soccer', 'olympics', etc.]
- `summer` - ['summer', 'beach', 'water', 'ocean', 'vacation', 'camp', etc.]
- `halloween` - ['halloween', 'spooky', 'fun', 'mysterious', 'exciting', 'ghost', 'witch', etc.]
- `christmas` - ['christmas', 'holiday', 'santa', 'festive', 'celebration', etc.]
- `winter` - ['winter', 'snow', 'ice', 'cold', 'skiing', 'arctic', etc.]

**Matching Logic:**
- **Vibes:** Use sentiment analysis + keyword matching (emotional descriptors)
- **Themes:** Use keyword matching only (content descriptors)
- **Mixed Sentiments:** Inclusive OR logic - match on ANY keyword, not ALL keywords

**✅ User Input Complete**
All vibe emotional keywords and theme content keywords have been defined and are ready for implementation.

### Phase 3: Enhanced Recommendation Scoring

**New Scoring Algorithm:**
```
Total Score = Base Score × Sentiment Weight × Genre Weight × Other Factors

Where:
- Sentiment Weight: 60-70% (PRIMARY)
- Genre Weight: 20-25%
- Other Factors: 10-15% (keywords, year, vote count)
```

**Enhanced Matching Logic:**
1. **Vibe Matching:** 
   - Analyze movie overview using sentiment analysis API
   - Extract emotional keywords/descriptors
   - Compare against vibe's emotional profile
   - Calculate vibe alignment score (0-1)

2. **Theme Matching:**
   - Search movie overview for content keywords
   - Use inclusive OR logic (ANY keyword match = positive)
   - Calculate theme alignment score (0-1)
   - Ensure movie actually contains theme elements

3. **Combined Scoring:**
   - Apply vibe + theme alignment as primary multipliers
   - Maintain existing genre/keyword logic as secondary factors

### Phase 4: Technical Implementation

**New Files to Create:**
- `src/services/sentimentAnalysis.ts` - API integration
- `src/types/sentiment.ts` - Type definitions
- `src/utils/sentimentMapping.ts` - Vibe/theme sentiment mappings

**Files to Modify:**
- `src/services/movieRecommendations.ts` - Enhanced scoring algorithm
- `package.json` - Add any new dependencies

**API Integration Details:**
```typescript
interface SentimentResponse {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number; // confidence 0-1
}

interface MovieSentiment {
  overview: SentimentResponse;
  vibeAlignment: number; // 0-1 match score
  themeAlignment: number; // 0-1 match score
}
```

## Success Criteria
1. ✅ Users receive recommendations that better match their emotional preferences
2. ✅ Vibe and theme selections become the primary drivers of recommendations
3. ✅ System maintains good performance with real-time sentiment analysis
4. ✅ Recommendation quality improves based on user feedback
5. ✅ Foundation established for future user review sentiment integration

## Future Enhancements (Out of Scope)
- Integration with user review sentiment analysis
- Sentiment analysis of movie trailers/dialogue
- User feedback loop for sentiment preference learning
- Caching of sentiment scores for popular movies

## Technical Risks & Mitigations
**Risk:** API rate limits or downtime
**Mitigation:** Implement graceful fallback to current recommendation system

**Risk:** Sentiment analysis accuracy for movie overviews
**Mitigation:** Start with proven models, monitor recommendation quality

**Risk:** Performance impact of real-time API calls
**Mitigation:** Implement request batching and consider caching popular movies

## Dependencies
- Hugging Face Inference API access
- No new npm packages required (using fetch API)

## Timeline Estimate
- **Phase 1:** 1-2 hours (API integration)
- **Phase 2:** 30 minutes (sentiment mapping - pending user input)
- **Phase 3:** 2-3 hours (algorithm enhancement)
- **Phase 4:** 1 hour (testing and refinement)

**Total:** ~5-6 hours development time

---

## Next Steps
1. **Get user input on sentiment categories** ⏳
2. Implement Hugging Face API integration
3. Create sentiment mapping system
4. Enhance recommendation scoring algorithm
5. Test and refine system

---

*This spec serves as the blueprint for integrating sentiment analysis to make vibe and theme matching the primary driver of movie recommendations.*
