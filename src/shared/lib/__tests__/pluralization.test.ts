import { pluralize, pluralizeAdvanced, formatCount } from '../pluralization';

describe('pluralization helpers', () => {
  describe('pluralize (basic)', () => {
    it('should return singular for count of 1', () => {
      expect(pluralize('view', 1)).toBe('view');
      expect(pluralize('item', 1)).toBe('item');
    });

    it('should return plural for count other than 1', () => {
      expect(pluralize('view', 0)).toBe('views');
      expect(pluralize('view', 2)).toBe('views');
      expect(pluralize('view', 100)).toBe('views');
      expect(pluralize('item', 3)).toBe('items');
    });
  });

  describe('pluralizeAdvanced', () => {
    it('should return singular for count of 1', () => {
      expect(pluralizeAdvanced('view', 1)).toBe('view');
      expect(pluralizeAdvanced('child', 1)).toBe('child');
      expect(pluralizeAdvanced('knife', 1)).toBe('knife');
    });

    describe('irregular plurals', () => {
      it('should handle common irregular plurals', () => {
        expect(pluralizeAdvanced('child', 2)).toBe('children');
        expect(pluralizeAdvanced('person', 2)).toBe('people');
        expect(pluralizeAdvanced('mouse', 2)).toBe('mice');
        expect(pluralizeAdvanced('foot', 2)).toBe('feet');
        expect(pluralizeAdvanced('tooth', 2)).toBe('teeth');
        expect(pluralizeAdvanced('goose', 2)).toBe('geese');
      });

      it('should preserve case for irregular plurals', () => {
        expect(pluralizeAdvanced('Child', 2)).toBe('Children');
        expect(pluralizeAdvanced('PERSON', 2)).toBe('PEOPLE');
        expect(pluralizeAdvanced('Mouse', 2)).toBe('Mice');
      });
    });

    describe('words ending in y', () => {
      it('should change y to ies when preceded by consonant', () => {
        expect(pluralizeAdvanced('city', 2)).toBe('cities');
        expect(pluralizeAdvanced('party', 2)).toBe('parties');
        expect(pluralizeAdvanced('story', 2)).toBe('stories');
        expect(pluralizeAdvanced('company', 2)).toBe('companies');
      });

      it('should just add s when y is preceded by vowel', () => {
        expect(pluralizeAdvanced('boy', 2)).toBe('boys');
        expect(pluralizeAdvanced('day', 2)).toBe('days');
        expect(pluralizeAdvanced('key', 2)).toBe('keys');
        expect(pluralizeAdvanced('toy', 2)).toBe('toys');
      });

      it('should handle single character y', () => {
        expect(pluralizeAdvanced('y', 2)).toBe('ys');
      });

      it('should handle case variations in consonant check', () => {
        expect(pluralizeAdvanced('City', 2)).toBe('Cities');
        expect(pluralizeAdvanced('PARTY', 2)).toBe('PARTIES');
      });
    });

    describe('words ending in s, sh, ch, x, z', () => {
      it('should add es to words ending in s', () => {
        expect(pluralizeAdvanced('class', 2)).toBe('classes');
        expect(pluralizeAdvanced('glass', 2)).toBe('glasses');
        expect(pluralizeAdvanced('bus', 2)).toBe('buses');
      });

      it('should add es to words ending in sh', () => {
        expect(pluralizeAdvanced('dish', 2)).toBe('dishes');
        expect(pluralizeAdvanced('brush', 2)).toBe('brushes');
        expect(pluralizeAdvanced('flash', 2)).toBe('flashes');
      });

      it('should add es to words ending in ch', () => {
        expect(pluralizeAdvanced('church', 2)).toBe('churches');
        expect(pluralizeAdvanced('watch', 2)).toBe('watches');
        expect(pluralizeAdvanced('batch', 2)).toBe('batches');
      });

      it('should add es to words ending in x', () => {
        expect(pluralizeAdvanced('box', 2)).toBe('boxes');
        expect(pluralizeAdvanced('fox', 2)).toBe('foxes');
        expect(pluralizeAdvanced('tax', 2)).toBe('taxes');
      });

      it('should add es to words ending in z', () => {
        expect(pluralizeAdvanced('quiz', 2)).toBe('quizzes');
        expect(pluralizeAdvanced('buzz', 2)).toBe('buzzes');
      });
    });

    describe('words ending in f or fe', () => {
      it('should change fe to ves (more specific rule first)', () => {
        expect(pluralizeAdvanced('knife', 2)).toBe('knives');
        expect(pluralizeAdvanced('wife', 2)).toBe('wives');
        expect(pluralizeAdvanced('life', 2)).toBe('lives');
      });

      it('should change f to ves', () => {
        expect(pluralizeAdvanced('leaf', 2)).toBe('leaves');
        expect(pluralizeAdvanced('half', 2)).toBe('halves');
        expect(pluralizeAdvanced('shelf', 2)).toBe('shelves');
      });
    });

    describe('default rule', () => {
      it('should add s for regular words', () => {
        expect(pluralizeAdvanced('view', 2)).toBe('views');
        expect(pluralizeAdvanced('cat', 2)).toBe('cats');
        expect(pluralizeAdvanced('book', 2)).toBe('books');
        expect(pluralizeAdvanced('computer', 2)).toBe('computers');
      });
    });

    describe('edge cases', () => {
      it('should handle empty strings', () => {
        expect(pluralizeAdvanced('', 2)).toBe('s');
      });

      it('should handle single character words', () => {
        expect(pluralizeAdvanced('a', 2)).toBe('as');
        expect(pluralizeAdvanced('f', 2)).toBe('ves');
      });

      it('should handle mixed case words', () => {
        expect(pluralizeAdvanced('View', 2)).toBe('Views');
        expect(pluralizeAdvanced('KNIFE', 2)).toBe('KNIVES');
        expect(pluralizeAdvanced('City', 2)).toBe('Cities');
      });
    });
  });

  describe('formatCount', () => {
    it('should format count with singular form for 1', () => {
      expect(formatCount('view', 1)).toBe('1 view');
      expect(formatCount('item', 1)).toBe('1 item');
    });

    it('should format count with plural form for other numbers', () => {
      expect(formatCount('view', 0)).toBe('0 views');
      expect(formatCount('view', 2)).toBe('2 views');
      expect(formatCount('view', 100)).toBe('100 views');
    });

    it('should work with advanced pluralization rules', () => {
      expect(formatCount('child', 1)).toBe('1 child');
      expect(formatCount('child', 2)).toBe('2 children');
      expect(formatCount('knife', 1)).toBe('1 knife');
      expect(formatCount('knife', 2)).toBe('2 knives');
      expect(formatCount('city', 1)).toBe('1 city');
      expect(formatCount('city', 2)).toBe('2 cities');
    });
  });
});