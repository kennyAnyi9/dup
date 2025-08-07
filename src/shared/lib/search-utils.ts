/**
 * Advanced search utilities for fuzzy matching and relevance scoring
 */

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: number[];
  score: number;
}

export interface SearchOptions {
  keys: string[]; // Fields to search in
  threshold?: number; // Minimum score threshold (0-1)
  maxResults?: number; // Maximum number of results
  fuzzyThreshold?: number; // Fuzzy matching threshold (0-1)
  includeMatches?: boolean; // Include match details
  weights?: Record<string, number>; // Field weights for scoring
}

/**
 * Calculate optimized Levenshtein distance with early termination
 */
function levenshteinDistance(a: string, b: string, maxDistance = Infinity): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  // Early exit if strings are too different in length
  const lengthDiff = Math.abs(a.length - b.length);
  if (lengthDiff > maxDistance) return maxDistance + 1;

  // Use single array instead of matrix for memory optimization
  let previousRow = Array(a.length + 1);
  let currentRow = Array(a.length + 1);

  // Initialize first row
  for (let i = 0; i <= a.length; i++) {
    previousRow[i] = i;
  }

  for (let j = 1; j <= b.length; j++) {
    currentRow[0] = j;
    let minInRow = j;

    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[i] = Math.min(
        currentRow[i - 1] + 1,     // deletion
        previousRow[i] + 1,        // insertion
        previousRow[i - 1] + cost  // substitution
      );
      minInRow = Math.min(minInRow, currentRow[i]);
    }

    // Early termination if minimum distance in row exceeds threshold
    if (minInRow > maxDistance) {
      return maxDistance + 1;
    }

    // Swap rows
    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[a.length];
}

/**
 * Calculate fuzzy match score (0-1, where 1 is perfect match)
 */
function fuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;
  
  const queryLower = query.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Exact match gets highest score
  if (queryLower === targetLower) return 1;
  
  // Check if query is contained in target
  if (targetLower.includes(queryLower)) {
    // Shorter targets with the query get higher scores
    const containmentScore = queryLower.length / targetLower.length;
    return Math.min(0.95, containmentScore + 0.3);
  }
  
  // Calculate fuzzy match using optimized Levenshtein distance
  const maxLength = Math.max(queryLower.length, targetLower.length);
  if (maxLength === 0) return 0;
  
  // Set reasonable max distance threshold for performance
  const maxDistance = Math.ceil(maxLength * 0.7); // Allow up to 70% differences
  const distance = levenshteinDistance(queryLower, targetLower, maxDistance);
  
  // Early exit if distance exceeds threshold
  if (distance > maxDistance) return 0;
  
  const similarity = 1 - (distance / maxLength);
  return Math.max(0, similarity);
}

/**
 * Find all occurrences of a pattern in text with fuzzy matching
 */
function findMatches(query: string, text: string, fuzzyThreshold = 0.6): number[] {
  if (!query || !text) return [];
  
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase();
  const indices: number[] = [];
  
  // Find exact matches first
  let index = textLower.indexOf(queryLower);
  while (index !== -1) {
    indices.push(index);
    index = textLower.indexOf(queryLower, index + 1);
  }
  
  // If no exact matches, try word-based fuzzy matching
  if (indices.length === 0) {
    const words = textLower.split(/\s+/);
    let currentIndex = 0;
    
    for (const word of words) {
      const score = fuzzyScore(queryLower, word);
      if (score >= fuzzyThreshold) {
        const wordIndex = textLower.indexOf(word, currentIndex);
        if (wordIndex !== -1) {
          indices.push(wordIndex);
        }
      }
      currentIndex = textLower.indexOf(word, currentIndex) + word.length;
    }
  }
  
  return indices;
}

/**
 * Calculate relevance score for a search result
 */
function calculateRelevance(
  query: string,
  item: unknown,
  matches: SearchMatch[],
  weights: Record<string, number> = {}
): number {
  if (matches.length === 0) return 0;
  
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const match of matches) {
    const weight = weights[match.field] || 1;
    totalScore += match.score * weight;
    totalWeight += weight;
  }
  
  const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  // Boost score for multiple field matches
  const fieldBonus = Math.min(0.2, matches.length * 0.05);
  
  // Boost score for matches in important fields (higher weights)
  const importanceBonus = Math.max(...matches.map(m => (weights[m.field] || 1) * 0.1));
  
  return Math.min(1, averageScore + fieldBonus + importanceBonus);
}

/**
 * Advanced search function with fuzzy matching and relevance scoring
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  options: SearchOptions
): SearchResult<T>[] {
  if (!query || !items.length) return [];
  
  const {
    keys,
    threshold = 0.3,
    maxResults = 50,
    fuzzyThreshold = 0.6,
    includeMatches = true,
    weights = {}
  } = options;
  
  const results: SearchResult<T>[] = [];
  const queryLower = query.toLowerCase().trim();
  
  for (const item of items) {
    const matches: SearchMatch[] = [];
    
    // Search in each specified field
    for (const key of keys) {
      const value = getNestedValue(item, key);
      if (!value || typeof value !== 'string') continue;
      
      const fieldMatches = findMatches(queryLower, value, fuzzyThreshold);
      
      if (fieldMatches.length > 0) {
        const fieldScore = fuzzyScore(queryLower, value);
        
        matches.push({
          field: key,
          value,
          indices: fieldMatches,
          score: fieldScore
        });
      }
    }
    
    // Calculate overall relevance score
    if (matches.length > 0) {
      const score = calculateRelevance(queryLower, item, matches, weights);
      
      if (score >= threshold) {
        results.push({
          item,
          score,
          matches: includeMatches ? matches : []
        });
      }
    }
  }
  
  // Sort by relevance score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  // Limit results
  return results.slice(0, maxResults);
}

/**
 * Get nested object value by dot notation path
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      // Handle array access like "tags.0.name" or "tags.name" for all array items
      if (Array.isArray(current)) {
        const numKey = parseInt(key, 10);
        if (!isNaN(numKey)) {
          return current[numKey];
        } else {
          // Search all array items for the key
          return current.map(item => (item as Record<string, unknown>)?.[key]).filter(Boolean).join(' ');
        }
      }
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(
  text: string,
  matches: number[],
  queryLength: number,
  className = 'search-highlight'
): string {
  if (!matches.length) return text;
  
  // Sort matches and remove duplicates
  const sortedMatches = [...new Set(matches)].sort((a, b) => a - b);
  
  let result = '';
  let lastIndex = 0;
  
  for (const matchIndex of sortedMatches) {
    // Add text before the match
    result += text.slice(lastIndex, matchIndex);
    
    // Add highlighted match
    const matchText = text.slice(matchIndex, matchIndex + queryLength);
    result += `<span class="${className}">${matchText}</span>`;
    
    lastIndex = matchIndex + queryLength;
  }
  
  // Add remaining text
  result += text.slice(lastIndex);
  
  return result;
}

/**
 * Extract search suggestions from items
 */
export function getSearchSuggestions<T>(
  items: T[],
  keys: string[],
  query: string,
  limit = 5
): string[] {
  if (!query || query.length < 2) return [];
  
  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase().trim();
  
  for (const item of items) {
    for (const key of keys) {
      const value = getNestedValue(item, key);
      if (typeof value === 'string') {
        const words = value.toLowerCase().split(/\s+/);
        
        for (const word of words) {
          if (word.startsWith(queryLower) && word.length > queryLower.length) {
            suggestions.add(word);
          }
        }
      }
    }
    
    if (suggestions.size >= limit * 2) break; // Get more than needed to filter
  }
  
  return Array.from(suggestions)
    .slice(0, limit)
    .sort((a, b) => a.length - b.length); // Prefer shorter suggestions
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}