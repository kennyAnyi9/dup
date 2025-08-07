/**
 * Component for highlighting search matches in text
 */

import { useMemo } from "react";

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
  maxLength?: number;
}

export function SearchHighlight({ 
  text, 
  searchTerm, 
  className = "", 
  highlightClassName = "bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded",
  maxLength = 200 
}: SearchHighlightProps) {
  const highlightedContent = useMemo(() => {
    if (!searchTerm || !text) return [];
    
    const trimmedText = maxLength && text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    const textLower = trimmedText.toLowerCase();
    
    // Find all matches
    const matches: { start: number; end: number }[] = [];
    let index = 0;
    
    while (index < textLower.length) {
      const matchIndex = textLower.indexOf(searchTermLower, index);
      if (matchIndex === -1) break;
      
      matches.push({
        start: matchIndex,
        end: matchIndex + searchTermLower.length
      });
      
      index = matchIndex + 1;
    }
    
    if (matches.length === 0) return [{ type: 'text', content: trimmedText }];
    
    // Build content parts array for safe rendering
    const parts: Array<{ type: 'text' | 'highlight', content: string }> = [];
    let lastIndex = 0;
    
    for (const match of matches) {
      // Add text before the match
      if (lastIndex < match.start) {
        parts.push({ type: 'text', content: trimmedText.slice(lastIndex, match.start) });
      }
      
      // Add highlighted match
      parts.push({ type: 'highlight', content: trimmedText.slice(match.start, match.end) });
      
      lastIndex = match.end;
    }
    
    // Add remaining text
    if (lastIndex < trimmedText.length) {
      parts.push({ type: 'text', content: trimmedText.slice(lastIndex) });
    }
    
    return parts;
  }, [text, searchTerm, maxLength]);
  
  return (
    <span className={className}>
      {highlightedContent.map((part, index) => 
        part.type === 'highlight' ? (
          <span key={index} className={highlightClassName}>
            {part.content}
          </span>
        ) : (
          part.content
        )
      )}
    </span>
  );
}

/**
 * Simple text highlighter for search results without HTML
 */
export function SimpleSearchHighlight({ 
  text, 
  searchTerm, 
  className = "",
  maxLength = 200 
}: Omit<SearchHighlightProps, 'highlightClassName'>) {
  if (!searchTerm || !text) return <span className={className}>{text}</span>;
  
  const trimmedText = maxLength && text.length > maxLength 
    ? text.substring(0, maxLength) + "..." 
    : text;
    
  const parts = trimmedText.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

/**
 * Hook to get search suggestions
 */
export function useSearchSuggestions(
  items: unknown[],
  searchTerm: string,
  fields: string[] = ['title', 'description'],
  limit: number = 5
) {
  return useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const suggestions = new Set<string>();
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    for (const item of items) {
      for (const field of fields) {
        const value = (item as Record<string, unknown>)[field];
        if (typeof value === 'string') {
          const words = value.toLowerCase().split(/\s+/);
          
          for (const word of words) {
            if (word.startsWith(searchTermLower) && word.length > searchTermLower.length) {
              suggestions.add(word);
              if (suggestions.size >= limit * 2) break;
            }
          }
        }
      }
      
      if (suggestions.size >= limit * 2) break;
    }
    
    return Array.from(suggestions)
      .slice(0, limit)
      .sort((a, b) => a.length - b.length);
  }, [items, searchTerm, fields, limit]);
}