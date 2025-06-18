import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getPublicPastesPaginatedClient } from '../paste.client-actions';

// Mock fetch globally
const originalFetch = globalThis.fetch;

describe('getPublicPastesPaginatedClient', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    // Restore original fetch
    globalThis.fetch = originalFetch;
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
          createdAt: '2023-01-01T00:00:00Z',
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
          createdAt: '2023-01-01T00:00:00Z',
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
      // Simulate timeout
      await new Promise((_, reject) => {
        setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 100);
      });
      return new Response('{}');
    };

    await expect(getPublicPastesPaginatedClient(1, 10)).rejects.toThrow(
      'Unable to load pastes. Please try again later.'
    );
  });
});