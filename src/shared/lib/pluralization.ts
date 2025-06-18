/**
 * Simple pluralization helper for i18n compatibility
 * This can be easily replaced with a proper i18n library in the future
 */

export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

export function formatCount(word: string, count: number): string {
  return `${count} ${pluralize(word, count)}`;
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

export function pluralizeAdvanced(word: string, count: number): string {
  if (count === 1) return word;
  
  // Check irregular plurals first
  if (irregularPlurals[word]) {
    return irregularPlurals[word];
  }
  
  // Apply common English pluralization rules
  if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2])) {
    return word.slice(0, -1) + 'ies';
  }
  
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  
  if (word.endsWith('f')) {
    return word.slice(0, -1) + 'ves';
  }
  
  if (word.endsWith('fe')) {
    return word.slice(0, -2) + 'ves';
  }
  
  // Default: just add 's'
  return word + 's';
}