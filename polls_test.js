import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock functions from your main script
async function fetchPollIds() {
  // Implementation from your original code
}

async function fetchItem(itemId) {
  // Implementation from your original code
}

let pollIds = [];
const pollsPerLoad = 10;
let loadedPolls = 0;
const collectedPolls = [];
let isInitialLoad = true;

// Mock the fetch function globally for testing
global.fetch = vi.fn();

const mockPollId = 123; // Example poll ID for testing

// Mock the responses for fetch calls
fetch.mockImplementation((url) => {
  if (url.includes('topstories.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([mockPollId]), // Returning the mocked poll ID
    });
  } else if (url.includes('/item/')) {
    const itemId = url.split('/').pop().split('.')[0];
    if (itemId == mockPollId) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: mockPollId,
          title: "Test Poll Title",
          by: "test_user",
          time: 1629300000,
          score: 5,
          type: "poll",
          parts: [456, 789], // Mock parts (poll options)
        }),
      });
    } else if (itemId == 456 || itemId == 789) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: itemId,
          text: `Option ${itemId}`,
          score: Math.floor(Math.random() * 10), // Random score for options
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
describe('Poll Functions', () => {
  beforeEach(() => {
    loadedPolls = 0; // Reset loadedPolls before each test
    pollIds = []; // Reset pollIds before each test
    fetch.mockClear(); // Clear fetch mock history
  });

  // Test fetchPollIds function
  it('fetchPollIds should return poll IDs', async () => {
    const result = await fetchPollIds();
    expect(result).toEqual([mockPollId]); // Check if we got the correct poll ID
  });

  // Test fetchItem function
  it('fetchItem should return an item with the expected title', async () => {
    const item = await fetchItem(mockPollId);
    expect(item).not.toBeNull();
    expect(item.title).toBe("Test Poll Title");
  });

  // Test loadMorePolls function
  it('loadMorePolls should load at least one poll', async () => {
    const container = document.createElement('div'); // Simulate the polls container
    container.id = "polls";
    document.body.appendChild(container);

    await loadMorePolls();
    
    expect(container.childElementCount).toBeGreaterThan(0); // Ensure a poll is displayed
    document.body.removeChild(container); // Clean up
  });
  
  // Test loadMorePolls function for initial load
  it('loadMorePolls should handle initial loading correctly', async () => {
    await loadMorePolls();
    expect(loadedPolls).toBe(1); // Ensure one poll is loaded
  });

  // Test the error handling
  it('loadMorePolls should handle fetch errors gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    const container = document.createElement('div'); // Simulate the polls container
    container.id = "polls";
    document.body.appendChild(container);

    await loadMorePolls();
    
    expect(container.childElementCount).toBe(0); // Ensure no polls are displayed
    expect(container.querySelector('.error-message')).not.toBeNull(); // Check for error message
    document.body.removeChild(container); // Clean up
  });
});
