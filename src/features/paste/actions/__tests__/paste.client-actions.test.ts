import { describe, it, expect, afterEach } from 'bun:test';
import { getPublicPastesPaginatedClient } from '../paste.client-actions';

// Mock fetch globally
const originalFetch = globalThis.fetch;

describe('getPublicPastesPaginatedClient', () => {
  afterEach(() => {
    // Restore original fetch to ensure clean slate
    globalThis.fetch = originalFetch;
  });

  describe('parameter validation', () => {
    it('should reject invalid page parameters', async () => {
      await expect(getPublicPastesPaginatedClient(NaN, 10)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(Infinity, 10)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(-1, 10)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(0, 10)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(1.5, 10)).rejects.toThrow();
    });

    it('should reject invalid limit parameters', async () => {
      await expect(getPublicPastesPaginatedClient(1, NaN)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(1, Infinity)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(1, -1)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(1, 0)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(1, 1.5)).rejects.toThrow();
      await expect(getPublicPastesPaginatedClient(1, 101)).rejects.toThrow(); // Over max limit
    });

    it('should accept valid parameters and call correct URL', async () => {
      let calledUrl: string | undefined;
      
      // Mock successful response for valid params and capture URL
      globalThis.fetch = async (input) => {
        calledUrl = input as string;
        return new Response(JSON.stringify({
          pastes: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      await expect(getPublicPastesPaginatedClient(1, 10)).resolves.toBeDefined();
      expect(calledUrl).toBe('/api/pastes/public?page=1&limit=10');

      await expect(getPublicPastesPaginatedClient(5, 50)).resolves.toBeDefined();
      expect(calledUrl).toBe('/api/pastes/public?page=5&limit=50');

      await expect(getPublicPastesPaginatedClient(1, 100)).resolves.toBeDefined(); // Max limit
      expect(calledUrl).toBe('/api/pastes/public?page=1&limit=100');
    });
  });

  it('should validate and parse a valid API response', async () => {
    const mockResponse = {
      pastes: [
        {
          id: 'paste-1',
          slug: 'test-slug',
          title: 'Test Paste',
          description: 'A test paste',
          language: 'javascript',
          views: 42,
          createdAt: '2023-01-01T00:00:00.000Z',
          user: {
            id: 'user-1',
            name: 'Test User',
            image: 'https://example.com/avatar.jpg',
          },
          tags: [
            {
              id: 'tag-1',
              name: 'React',
              slug: 'react',
              color: '#61dafb',
            },
          ],
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasMore: false,
      },
    };

    globalThis.fetch = async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    const result = await getPublicPastesPaginatedClient(1, 10);
    
    expect(result).toEqual(mockResponse);
    expect(result.pastes).toHaveLength(1);
    expect(result.pastes[0].id).toBe('paste-1');
    expect(result.pagination.hasMore).toBe(false);
  });

  it('should handle null values correctly', async () => {
    const mockResponse = {
      pastes: [
        {
          id: 'paste-1',
          slug: 'test-slug',
          title: null,
          description: null,
          language: 'javascript',
          views: 0,
          createdAt: '2023-01-01T00:00:00.000Z',
          user: null,
          tags: [],
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasMore: false,
      },
    };

    globalThis.fetch = async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    const result = await getPublicPastesPaginatedClient(1, 10);
    
    expect(result.pastes[0].title).toBeNull();
    expect(result.pastes[0].description).toBeNull();
    expect(result.pastes[0].user).toBeNull();
    expect(result.pastes[0].tags).toHaveLength(0);
  });

  it('should throw an error for invalid response structure', async () => {
    const invalidResponse = {
      pastes: 'not-an-array',
      pagination: 'invalid',
    };

    globalThis.fetch = async () =>
      new Response(JSON.stringify(invalidResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await expect(getPublicPastesPaginatedClient(1, 10)).rejects.toThrow(
      'Unable to load pastes. Please try again later.'
    );
  });

  it('should throw an error for missing required fields', async () => {
    const invalidResponse = {
      pastes: [
        {
          id: 'paste-1',
          // Missing required fields like slug, language, etc.
          title: 'Test',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasMore: false,
      },
    };

    globalThis.fetch = async () =>
      new Response(JSON.stringify(invalidResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await expect(getPublicPastesPaginatedClient(1, 10)).rejects.toThrow(
      'Unable to load pastes. Please try again later.'
    );
  });

  it('should throw an error for HTTP errors', async () => {
    globalThis.fetch = async () =>
      new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      });

    await expect(getPublicPastesPaginatedClient(1, 10)).rejects.toThrow(
      'Unable to load pastes. Please try again later.'
    );
  });

  it('should handle network errors', async () => {
    globalThis.fetch = async () => {
      throw new Error('Network error');
    };

    await expect(getPublicPastesPaginatedClient(1, 10)).rejects.toThrow(
      'Unable to load pastes. Please try again later.'
    );
  });

  it('should handle timeout errors', async () => {
    globalThis.fetch = async () => {
      // Simulate timeout - promise rejects, no return needed
      await new Promise((_, reject) => {
        setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 100);
      });
    };

    await expect(getPublicPastesPaginatedClient(1, 10)).rejects.toThrow(
      'Unable to load pastes. Please try again later.'
    );
  });
});