import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock functions from your main script
async function fetchMaxItemId() {
  // Implementation from your original code
}

async function fetchItem(itemId) {
  // Implementation from your original code
}

let loadedPosts = 0;

// Mock the fetch function globally for testing
global.fetch = vi.fn();

const maxItemId = 123456; // Example max item ID for testing

// Mock the responses for fetch calls
fetch.mockImplementation((url) => {
  if (url.includes('maxitem.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(maxItemId),
    });
  } else if (url.includes('/item/')) {
    const itemId = url.split('/').pop().split('.')[0];
    if (itemId == maxItemId) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: maxItemId,
          title: "Test Story Title",
          url: "https://example.com/test-story",
          by: "test_user",
          time: 1629300000,
          score: 42,
          type: "story",
          kids: [],
          parent: null
        }),
      });
    } else {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      });
    }
  }
  
  return Promise.reject(new Error('Unknown URL'));
});

// Group tests
describe('Hacker News API Functions', () => {
  beforeEach(() => {
    loadedPosts = 0; // Reset loadedPosts before each test
    fetch.mockClear(); // Clear fetch mock history
  });

  // Test fetchMaxItemId function
  it('fetchMaxItemId should return the maximum item ID', async () => {
    const result = await fetchMaxItemId();
    expect(result).toBe(maxItemId);
  });

  // Test fetchItem function
  it('fetchItem should return an item with the expected title', async () => {
    const item = await fetchItem(maxItemId);
    expect(item).not.toBeNull();
    expect(item.title).toBe("Test Story Title");
  });

  // Test loadMorePosts function
  it('loadMorePosts should load at least one post', async () => {
    const container = document.createElement('div'); // Simulate the stories container
    container.id = "stories";
    document.body.appendChild(container);

    await loadMorePosts();
    
    expect(container.childElementCount).toBeGreaterThan(0);
    document.body.removeChild(container); // Clean up
  });
});
