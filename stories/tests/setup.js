import { afterEach, beforeEach } from "vitest";

// Optional: Mock global functions or variables if necessary
const mockFetch = async (url) => {
  // Mock implementation of fetch
  return Promise.resolve({
    ok: true,
    json: async () => {
      // Return a sample response based on URL
      if (url.includes("jobstories.json")) {
        return [1, 2, 3]; // Example job IDs
      } else if (url.includes("/item/")) {
        const itemId = url.split("/").pop().split(".")[0];
        return {
          id: parseInt(itemId),
          title: `Test Job Title ${itemId}`,
          url: `https://example.com/job/${itemId}`,
          by: "test_user",
          time: Math.floor(Date.now() / 1000), // Current time in seconds
          text: `This is a test description for job ${itemId}.`,
        };
      }
      return null;
    },
  });
};

// Mock the fetch function globally
global.fetch = mockFetch;

// Clean up after each test
afterEach(() => {
  // Reset fetch mock
  global.fetch.mockClear();
});

// Optional: Any global setup before tests run
beforeEach(() => {
  // Set up any global state before each test if necessary
});
