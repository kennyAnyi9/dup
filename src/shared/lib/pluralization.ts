/**
 * Simple pluralization helper for i18n compatibility
 * This can be easily replaced with a proper i18n library in the future
 */

/**
 * Basic pluralization - only suitable for simple cases like "view/views"
 * For production usage with complex words, use pluralizeAdvanced instead
 */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

export function formatCount(word: string, count: number): string {
  return `${count} ${pluralizeAdvanced(word, count)}`;
}

// Common pluralization rules can be extended here
const irregularPlurals: Record<string, string> = {
  'child': 'children',
  'person': 'people',
  'mouse': 'mice',
  'foot': 'feet',
  'tooth': 'teeth',
  'goose': 'geese',
};

function preserveCase(original: string, transformed: string): string {
  // Handle all uppercase
  if (original === original.toUpperCase()) {
    return transformed.toUpperCase();
  }
  // Handle first letter uppercase
  if (original[0] === original[0].toUpperCase()) {
    return transformed[0].toUpperCase() + transformed.slice(1);
  }
  return transformed;
}

export function pluralizeAdvanced(word: string, count: number): string {
  if (count === 1) return word;
  
  // Check irregular plurals first (case-insensitive)
  const lower = word.toLowerCase();
  if (irregularPlurals[lower]) {
    return preserveCase(word, irregularPlurals[lower]);
  }
  
  // Apply common English pluralization rules
  const lowerWord = word.toLowerCase();
  
  if (lowerWord.endsWith('y') && word.length >= 2 && !['a', 'e', 'i', 'o', 'u'].includes(lowerWord[lowerWord.length - 2])) {
    return preserveCase(word, word.slice(0, -1) + 'ies');
  }
  
  if (lowerWord.endsWith('s') || lowerWord.endsWith('sh') || lowerWord.endsWith('ch') || lowerWord.endsWith('x')) {
    return preserveCase(word, word + 'es');
  }
  
  if (lowerWord.endsWith('z')) {
    // Double the z before adding es for single z endings
    if (lowerWord.length >= 2 && lowerWord[lowerWord.length - 2] !== 'z') {
      return preserveCase(word, word + 'zes');
    }
    return preserveCase(word, word + 'es');
  }
  
  if (lowerWord.endsWith('fe')) {
    return preserveCase(word, word.slice(0, -2) + 'ves');
  }
  
  if (lowerWord.endsWith('f')) {
    return preserveCase(word, word.slice(0, -1) + 'ves');
  }
  
  // Default: just add 's'
  return word + 's';
}