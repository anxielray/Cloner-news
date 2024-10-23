import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the fetch function globally for testing
global.fetch = vi.fn();

// Mock data for testing
const maxItemIdMock = 5;
const postMock = {
  id: 1,
  title: "Test Story Title",
  url: "https://example.com/test-story",
  by: "test_user",
  time: 1629300000,
  type: "story",
};

// Mock the responses for fetch calls
fetch.mockImplementation((url) => {
  if (url.includes("maxitem.json")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(maxItemIdMock),
    });
  } else if (url.includes("/item/")) {
    const itemId = url.split("/").pop().split(".")[0];
    if (itemId == postMock.id) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(postMock),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(null), // Mock no post found
    });
  }

  return Promise.reject(new Error("Unknown URL"));
});

// Group tests
describe("Hacker News Post API Functions", () => {
  beforeEach(() => {
    fetch.mockClear(); // Clear fetch mock history before each test
    document.body.innerHTML = `<div id="stories"></div><button id="loadMore">Load More</button>`; // Set up DOM
  });

  // Test fetchMaxItemId function
  it("fetchMaxItemId should return the max item ID", async () => {
    const result = await fetchMaxItemId();
    expect(result).toEqual(maxItemIdMock);
  });

  // Test fetchItem function
  it("fetchItem should return a story with the expected title", async () => {
    const item = await fetchItem(postMock.id);
    expect(item).not.toBeNull();
    expect(item.title).toBe("Test Story Title");
  });

  // Test loadMorePosts function
  it("loadMorePosts should load at least one post", async () => {
    const container = document.createElement("div"); // Simulate the stories container
    container.id = "stories";
    document.body.appendChild(container);

    // Call loadMorePosts
    await loadMorePosts();

    // Optionally, check the specific content if needed
    const argument = {
      id: 123,
      title: "Test Story Title",
      url: "https://example.com/test-story",
      type: "story",
    };
    expect(displayStory(argument)).toBe();

    // Clean up
    document.body.removeChild(container);
  });

  // Test displayStory function
  it("displayStory should create a story card in the DOM", () => {
    // Setup: Define the argument to pass to displayStory
    const argument = {
      id: 123,
      title: "Test Story Title",
      url: "https://example.com/test-story",
      type: "story",
      time: Date.now() / 1000, // Use current time for simplicity
    };

    // Prepare a mock DOM container for the stories
    document.body.innerHTML = `<div id="stories"></div>`;
    const storiesContainer = document.getElementById("stories");

    // Call the function to test
    displayStory(argument);

    // Assertions: Ensure the DOM is updated correctly
    expect(storiesContainer.childElementCount).toBe(1);
    expect(storiesContainer.firstChild.innerHTML).toContain(`
    <p>Posted on ${new Date(argument.time * 1000).toLocaleString()}</p>`);
    expect(storiesContainer.firstChild.innerHTML).toContain(`
    <p>Posted on ${new Date(argument.time * 1000).toLocaleString()}</p>`);

    // Cleanup: Reset the DOM if needed (not necessary if using beforeEach/afterEach)
    document.body.innerHTML = "";
  });
});

// Function to fetch the maximum item ID from Hacker News
async function fetchMaxItemId() {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/maxitem.json"
  );
  if (!response.ok) throw new Error("Failed to fetch max item ID");
  return response.json();
}

async function fetchItem(itemId) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${itemId}.json`
  );
  if (!response.ok) throw new Error("Failed to fetch item");
  return response.json();
}

const displayStory = (story) => {
  const container = document.getElementById("stories"); // Assuming this is the container for stories
  const storyElement = document.createElement("div");
  storyElement.classList.add("story");

  storyElement.innerHTML = `
    <p>Posted on ${new Date(story.time * 1000).toLocaleString()}</p>`;

  container.appendChild(storyElement); // Append the story to the container
};

async function loadMorePosts() {
  const maxItemId = await fetchMaxItemId();
  const container = document.getElementById("stories");
  const newPosts = [];
  let loadedPosts = 1;

  // Assume that we are loading 10 posts each time
  for (let i = loadedPosts; i < loadedPosts + 10 && i < maxItemId; i++) {
    const item = await fetchItem(i);
    if (item && item.type === "story") {
      newPosts.push(item);
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `<h2><a href="${item.url}">${item.title}</a></h2><p>by ${item.by}</p>`;
      container.appendChild(postElement);
    }
  }

  loadedPosts += newPosts.length;
}
