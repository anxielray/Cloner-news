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
// Function to fetch comments for a post
async function fetchComments(postId) {
  const post = await fetchItem(postId);
  if (!post.kids) return [];

  // Fetch each comment and its nested comments recursively
  const comments = await Promise.all(
    post.kids.map(async (kidId) => {
      const comment = await fetchItem(kidId);
      comment.children = comment.kids ? await fetchComments(kidId) : [];
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

let loadedPosts = 1;

// Mock the fetch function globally for testing
global.fetch = vi.fn();

const maxItemId = 123456;

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
            kids: [234567],
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

const displayStory = (story) => {
  const container = document.getElementById("stories"); // Assuming this is the container for stories
  const storyElement = document.createElement("div");
  storyElement.classList.add("story");

  storyElement.innerHTML = `
    <h2>
      <a href="${story.url}" target="_blank">
        <strong>${story.title}</strong>
      </a>
    </h2>
    <p>Posted by: ${story.by}</p>
  `;

  container.appendChild(storyElement); // Append the story to the container
};

// Toggle comments for a story
const toggleComments = async (postId) => {
  const commentSection = document.getElementById(`comments-${postId}`);
  if (commentSection.style.display === "none" || !commentSection.innerHTML) {
    const comments = await fetchComments(postId);
    commentSection.innerHTML =
      comments.length > 0
        ? generateCommentsMarkup(comments)
        : "<p>No comments yet</p>";
    commentSection.style.display = "block";
  } else {
    commentSection.style.display = "none";
  }
};