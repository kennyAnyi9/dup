"use client";

export async function getPublicPastesPaginatedClient(page: number = 1, limit: number = 10) {
  try {
    const response = await fetch(`/api/pastes/public?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching public pastes:', error);
    return { 
      pastes: [], 
      pagination: { 
        page, 
        limit, 
        total: 0, 
        totalPages: 0, 
        hasMore: false 
      } 
    };
  }
}