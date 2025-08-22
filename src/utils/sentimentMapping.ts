// Vibe and Theme keyword mappings for sentiment analysis

import type { VibeKeywords, ThemeKeywords } from '../types/sentiment';

export const VIBE_KEYWORDS: VibeKeywords = {
  cozy: ['warm', 'cozy', 'enchanting', 'heartwarming', 'comforting'],
  silly: ['playful', 'lighthearted', 'innocent', 'funny', 'cheerful', 'whimsical'],
  adventure: ['exciting', 'thrilling', 'bold', 'epic', 'energetic', 'heroic'],
  artsy: ['beautiful', 'contemplative', 'creative', 'unique', 'thoughtful', 'inspiring'],
  musical: ['upbeat', 'joyful', 'energetic', 'celebratory', 'rhythmic', 'lively'],
  classic: ['timeless', 'nostalgic', 'enduring'],
  millennial: ['nostalgic', 'familiar', 'comforting', 'fun', 'reminiscent', 'cherished', 
              'childhood', 'growing up', 'family', 'heartwarming',
              'adventure', 'friendship', 'coming of age', 'wholesome', 'classic']
};

export const THEME_KEYWORDS: ThemeKeywords = {
  animals: [
    'animal', 'animals', 'dog', 'dogs', 'cat', 'cats', 'panda', 'pandas',
    'wildlife', 'pet', 'pets', 'creature', 'creatures', 'beast', 'beasts',
    'lion', 'lions', 'tiger', 'tigers', 'bear', 'bears', 'elephant', 'elephants',
    'bird', 'birds', 'fish', 'horse', 'horses', 'cow', 'cows', 'pig', 'pigs',
    'rabbit', 'rabbits', 'mouse', 'mice', 'monkey', 'monkeys', 'wolf', 'wolves',
    'zoo', 'farm', 'jungle', 'safari', 'dinosaur', 'dragon', 'shark', 'dolphin',
    'fox', 'deer', 'penguin', 'turtle', 'frog', 'snake', 'spider', 'butterfly',
    'kitten', 'puppy', 'pony', 'hamster', 'guinea pig', 'parrot', 'owl',
    'forest', 'nature', 'wild', 'talking animal', 'anthropomorphic'
  ],
  sports: [
    'sport', 'sports', 'baseball', 'football', 'basketball', 'soccer', 'olympics',
    'athletic', 'athlete', 'athletes', 'competition', 'championship', 'team',
    'tennis', 'golf', 'hockey', 'swimming', 'running', 'racing', 'boxing',
    'wrestling', 'gymnastics', 'skiing', 'surfing', 'cycling', 'marathon',
    'coach', 'training', 'game', 'match', 'tournament', 'league', 'stadium',
    'court', 'field', 'track', 'underdog', 'victory', 'rival', 'workout',
    'fitness', 'martial arts', 'cheerleading', 'dance competition'
  ],
  summer: [
    'summer', 'beach', 'beaches', 'ocean', 'vacation', 'camp',
    'camping', 'swimming', 'surfing', 'sun', 'sunny', 'tropical', 'island',
    'pool', 'sailing', 'fishing', 'picnic', 'barbecue',
    'hot', 'warm', 'bikini', 'sunscreen', 'sandcastle', 'lifeguard', 'resort',
    'road trip', 'festival', 'sunshine',
    'camp counselor', 'summer camp', 'reunion', 'getaway'
  ],
  halloween: [
    'halloween', 'spooky', 'ghost', 'ghosts', 'witch', 'witches', 
    'supernatural', 'costume', 'costumes', 'trick or treat', 'trick-or-treat',
    'pumpkin', 'pumpkins', 'scary', 'monster', 'monsters',
    'vampire', 'vampires', 'zombie', 'zombies', 'haunted', 'creepy',
    'cemetery', 'graveyard', 'october', 'candy', 'eerie',
    'jack-o-lantern', 'frankenstein', 'dracula', 'mummy'
  ],
  christmas: [
    'christmas', 'santa', 'santa claus', 'reindeer', 
    'sleigh', 'mistletoe', 'wreath', 'carol', 'carols', 'christmas tree',
    'ornament', 'ornaments', 'xmas', 'noel', 'december 25',
    'chimney', 'workshop', 'north pole', 'gingerbread', 'christmas eve',
    'christmas day', 'jolly', 'ho ho ho', 'jingle', 'nutcracker',
    'christmas morning', 'christmas spirit', 'christmas miracle'
  ],
  winter: [
    'winter', 'snow', 'snowy', 'ice', 'icy', 'cold', 'skiing', 'arctic',
    'frozen', 'frost', 'blizzard', 'snowman', 'snowmen', 'sledding',
    'skating', 'snowball', 'snowflake', 'snowflakes', 'cabin', 'fireplace',
    'mittens', 'scarf', 'coat', 'boots', 'cocoa', 'hibernate',
    'chill', 'freezing', 'icicle', 'snowstorm', 'hot chocolate', 'warm',
    'cozy', 'lodge', 'mountain', 'ski resort', 'polar', 'tundra'
  ],
  none: []
};

/**
 * Calculate how well a text matches a vibe's emotional keywords
 * Uses inclusive OR logic - any keyword match contributes to score
 */
export function calculateVibeAlignment(text: string, vibeKeywords: string[]): number {
  if (!text || vibeKeywords.length === 0) return 0;
  
  const lowerText = text.toLowerCase();
  let matches = 0;
  
  for (const keyword of vibeKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  
  // Score based on percentage of keywords matched, with bonus for multiple matches
  const baseScore = matches > 0 ? 0.4 : 0; // Base score for any match
  const matchRatio = matches / vibeKeywords.length;
  const bonusScore = matchRatio * 0.6; // Up to 60% bonus based on match ratio
  
  return Math.min(baseScore + bonusScore, 1.0);
}

/**
 * Calculate how well a text matches a theme's content keywords
 * Uses inclusive OR logic - any keyword match contributes to score
 */
export function calculateThemeAlignment(text: string, themeKeywords: string[]): number {
  if (!text || themeKeywords.length === 0) return 1.0; // No theme restriction = perfect match
  
  const lowerText = text.toLowerCase();
  let matches = 0;
  const matchedKeywords: string[] = [];
  
  for (const keyword of themeKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches++;
      matchedKeywords.push(keyword);
    }
  }
  
  // For themes, we want to ensure content actually contains the theme elements
  // Be strict about theme matching - no matches = no theme alignment
  if (matches === 0) {
    return 0.0; // Zero score for non-matching movies - they shouldn't appear for this theme
  }
  
  // Good score for theme matches
  const baseScore = 0.9; // Very high base score for any theme match
  const bonusScore = Math.min((matches - 1) * 0.02, 0.1); // Small bonus for additional matches
  
  return Math.min(baseScore + bonusScore, 1.0);
}
