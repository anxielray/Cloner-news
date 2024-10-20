// Fetch the maximum item id from the maxItemId API
async function fetchMaxItemId() {
  try {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch maximum item ID:", error);
    alert("An error occurred while fetching the maximum item ID.");
  }
}

// Fetch the item details by itemId to confirm existence
async function fetchItem(itemId) {
  try {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${itemId}.json?print=pretty`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch item with ID ${itemId}:`, error);
    alert(`An error occurred while fetching item with ID ${itemId}.`);
  }
}

// Load a limited number of posts
let currentMaxId;
const postsPerLoad = 10;
let loadedPosts = 0;
let comments = [];

const loadMorePosts = async () => {
  try {
    // Initialize currentMaxId if not set
    if (!currentMaxId) {
      currentMaxId = await fetchMaxItemId();
      if (!currentMaxId) return; // Exit if unable to fetch max ID
    }

    // Load posts from currentMaxId downwards
    for (
      let itemId = currentMaxId;
      itemId >= 0 && loadedPosts < postsPerLoad;
      itemId--
    ) {
      const item = await fetchItem(itemId);
      if (!item) continue; // Skip if the item fetch failed

      if (item && !item.parent && item.title) {
        displayStories(item);
        loadedPosts++;
      } else if (item && item.parent) {
        comments.push(item);
      }

      // Short delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    currentMaxId -= loadedPosts;

    // Disable load more button if no more posts to load
    if (loadedPosts < postsPerLoad) {
      loadMoreButton.disabled = true;
      alert("No more posts available.");
    }
  } catch (error) {
    console.error("Error loading more posts:", error);
    alert("An error occurred while loading more posts.");
  }
};

// Function to display a story
const displayStories = (story) => {
  try {
    const container = document.getElementById("stories");
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h2>
        <a href="${story.url}" target="_blank"><h3><strong>${
      story.title
    }</strong></h3></a>
        <p>A ${story.type} by @${story.by}</p>
        <p>Posted on ${time(story.time)}</p>
        <p>Score: ${story.score}</p>
        <button onclick="toggleComments(${story.id})">Comments</button>
      </h2>`;
    container.appendChild(card);
  } catch (error) {
    console.error("Failed to display story:", error);
    alert("An error occurred while displaying the story.");
  }
};

// Function to display a comment
const displayComments = async (comment) => {
  try {
    const parentItem = await fetchItem(comment.parent);
    if (!parentItem) {
      throw new Error("Parent item not found");
    }
    
    const container = document.getElementById("stories");
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h2>
        <p><strong>@${comment.by} replying to @${parentItem.by}</strong></p>
        <p>${comment.text || "No text available"}</p>
      </h2>`;
    container.appendChild(card);
  } catch (error) {
    console.error("Failed to display comment:", error);
    alert("An error occurred while displaying the comment.");
  }
};

// Helper function to format time
const time = (ms) => {
  const date = new Date(ms * 1000);
  return date.toLocaleString();
};

// Load initial posts when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadMorePosts();
});

// Load more posts on clicking the load more button
const loadMoreButton = document.getElementById("loadMore");
loadMoreButton.addEventListener("click", () => {
  loadedPosts = 0;
  loadMorePosts();
});

// Toggle menu function
function toggleMenu() {
  try {
    const menu = document.getElementById("menu");
    menu.classList.toggle("show");
    const ham = document.getElementById("ham");
    ham.style.position = "relative";
    ham.style.zIndex = 10;
  } catch (error) {
    console.error("Failed to toggle menu:", error);
  }
}
