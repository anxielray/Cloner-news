import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock functions from your main script
async function fetchMaxItemId() {
  // Implementation from your original code
}

async function fetchItem(itemId) {
  // Implementation from your original code
}

let currentMaxId;
const postsPerLoad = 10;
let loadedPosts = 0;
let comments = [];

// Mock the fetch function globally for testing
global.fetch = vi.fn();

const mockMaxItemId = 100; // Example maximum item ID for testing
const mockItemId = 99; // Example item ID for testing

// Mock the responses for fetch calls
fetch.mockImplementation((url) => {
  if (url.includes('maxitem.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockMaxItemId), // Returning the mocked max item ID
    });
  } else if (url.includes('/item/')) {
    const itemId = url.split('/').pop().split('.')[0];
    if (itemId == mockItemId) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: mockItemId,
          title: "Test Story Title",
          by: "test_user",
          time: 1629300000,
          score: 10,
          type: "story",
          url: "https://example.com",
        }),
      });
    } else if (itemId == mockMaxItemId) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: mockMaxItemId,
          title: "Test Max Story Title",
          by: "max_user",
          time: 1629300000,
          score: 5,
          type: "story",
          url: "https://example.com/max",
        }),
      });
    }
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(null), // Return null for invalid IDs
    });
  }

  return Promise.reject(new Error('Unknown URL'));
});

// Group tests
describe('Post Functions', () => {
  beforeEach(() => {
    loadedPosts = 0; // Reset loadedPosts before each test
    comments = []; // Reset comments before each test
    currentMaxId = null; // Reset currentMaxId before each test
    fetch.mockClear(); // Clear fetch mock history
  });

  // Test fetchMaxItemId function
  it('fetchMaxItemId should return the maximum item ID', async () => {
    const result = await fetchMaxItemId();
    expect(result).toBe(mockMaxItemId); // Check if we got the correct max item ID
  });

  // Test fetchItem function
  it('fetchItem should return an item with the expected title', async () => {
    const item = await fetchItem(mockItemId);
    expect(item).not.toBeNull();
    expect(item.title).toBe("Test Story Title");
  });

  // Test loadMorePosts function
  it('loadMorePosts should load at least one post', async () => {
    const container = document.createElement('div'); // Simulate the stories container
    container.id = "stories";
    document.body.appendChild(container);

    await loadMorePosts();
    
    expect(container.childElementCount).toBeGreaterThan(0); // Ensure a post is displayed
    document.body.removeChild(container); // Clean up
  });
  
  // Test loadMorePosts function for initial load
  it('loadMorePosts should handle loading more posts correctly', async () => {
    await loadMorePosts();
    expect(loadedPosts).toBeGreaterThan(0); // Ensure posts are loaded
  });

  // Test the error handling
  it('loadMorePosts should handle fetch errors gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    const container = document.createElement('div'); // Simulate the stories container
    container.id = "stories";
    document.body.appendChild(container);

    await loadMorePosts();
    
    expect(container.childElementCount).toBe(0); // Ensure no posts are displayed
    expect(container.querySelector('.error-message')).not.toBeNull(); // Check for error message
    document.body.removeChild(container); // Clean up
  });
});
