import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock functions from your main script
// Function to fetch the maximum item ID from Hacker News
async function fetchMaxItemId() {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/maxitem.json"
  );
  if (!response.ok) throw new Error("Failed to fetch max item ID");
  return response.json();
}
// Function to fetch a specific item by ID from Hacker News
async function fetchItem(itemId) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${itemId}.json`
  );
  if (!response.ok) throw new Error("Failed to fetch item");
  return response.json();
}
// Function to load more posts (stories, jobs, polls)
async function loadMorePosts() {
  const maxItemId = await fetchMaxItemId();
  const container = document.getElementById("stories");
  const newPosts = []; // Array to hold newly loaded posts

  // Assume that we are loading 5 posts each time
  for (let i = loadedPosts; i < loadedPosts + 5 && i < maxItemId; i++) {
    const item = await fetchItem(i);
    if (item && item.type === "story") {
      newPosts.push(item);
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `<h2><a href="${item.url}">${item.title}</a></h2><p>by ${item.by}</p>`;
      container.appendChild(postElement);
    }
  }

  loadedPosts += newPosts.length; // Update loaded posts count
}
// Function to fetch comments for a post
async function fetchComments(postId) {
  const post = await fetchItem(postId);
  if (!post.kids) return []; // If there are no comments, return an empty array

  // Fetch each comment and its nested comments recursively
  const comments = await Promise.all(
    post.kids.map(async (kidId) => {
      const comment = await fetchItem(kidId);
      comment.children = comment.kids ? await fetchComments(kidId) : []; // Nested comments
      return comment;
    })
  );

  return comments;
}

const generateCommentsMarkup = (comments) => {
  // Mocked function to generate comments markup for testing
  return comments
    .map(
      (comment) =>
        `<div class="comment"><strong>${comment.by}:</strong> ${comment.text}</div>`
    )
    .join("");
};

let loadedPosts = 0;

// Mock the fetch function globally for testing
global.fetch = vi.fn();

const maxItemId = 123456; // Example max item ID for testing

// Mock the responses for fetch calls
fetch.mockImplementation((url) => {
  if (url.includes("maxitem.json")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(maxItemId),
    });
  } else if (url.includes("/item/")) {
    const itemId = url.split("/").pop().split(".")[0];
    if (itemId == maxItemId) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: maxItemId,
            title: "Test Story Title",
            url: "https://example.com/test-story",
            by: "test_user",
            time: 1629300000,
            score: 42,
            type: "story",
            kids: [234567], // Mocking a comment ID
          }),
      });
    } else if (itemId == 234567) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 234567,
            text: "This is a test comment",
            by: "comment_user",
            kids: [],
          }),
      });
    } else {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      });
    }
  }

  return Promise.reject(new Error("Unknown URL"));
});

// Group tests
describe("Hacker News API Functions", () => {
  beforeEach(() => {
    loadedPosts = 0; // Reset loadedPosts before each test
    fetch.mockClear(); // Clear fetch mock history
  });

  // Test fetchMaxItemId function
  it("fetchMaxItemId should return the maximum item ID", async () => {
    const result = await fetchMaxItemId();
    expect(result).toBe(maxItemId);
  });

  // Test fetchItem function
  it("fetchItem should return an item with the expected title", async () => {
    const item = await fetchItem(maxItemId);
    expect(item).not.toBeNull();
    expect(item.title).toBe("Test Story Title");
  });

  // Test loadMorePosts function
  it("loadMorePosts should load at least one post", async () => {
    const container = document.createElement("div"); // Simulate the stories container
    container.id = "stories";
    document.body.appendChild(container);

    await loadMorePosts();

    expect(container.childElementCount).toBeGreaterThan(0);
    document.body.removeChild(container); // Clean up
  });

  // Test fetchComments function
  it("fetchComments should return comments for a post", async () => {
    const comments = await fetchComments(maxItemId);
    expect(comments).not.toBeNull();
    expect(comments.length).toBe(1);
    expect(comments[0].text).toBe("This is a test comment");
  });

  // Test toggleComments function
  it("toggleComments should display comments when toggled", async () => {
    const commentSection = document.createElement("div"); // Simulate comment section
    commentSection.id = `comments-${maxItemId}`;
    commentSection.style.display = "none"; // Initially hidden
    document.body.appendChild(commentSection);

    await toggleComments(maxItemId);

    expect(commentSection.style.display).toBe("block");
    expect(commentSection.innerHTML).toContain("This is a test comment");

    // Toggle again to hide comments
    await toggleComments(maxItemId);
    expect(commentSection.style.display).toBe("none");

    document.body.removeChild(commentSection); // Clean up
  });
});
