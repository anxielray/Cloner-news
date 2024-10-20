// Fetch the maximum item id from the maxItemId API
async function fetchMaxItemId() {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

// Fetch the item details by itemId to confirm existence
async function fetchItem(itemId) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${itemId}.json?print=pretty`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data;
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
    }

    // Load posts from currentMaxId downwards
    for (
      let itemId = currentMaxId;
      itemId >= 0 && loadedPosts < postsPerLoad;
      itemId--
    ) {
      const item = await fetchItem(itemId);
      if (item && !item.parent && item.title) {
        displayStories(item);
        loadedPosts++;
      } else if (item && item.parent) {
        comments.push(item);
      }
      await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay to avoid overwhelming the API
    }

    currentMaxId -= loadedPosts;
    if (loadedPosts < postsPerLoad) {
      loadMoreButton.disabled = true;
    }
  } catch (error) {
    console.error("Error loading more posts:", error);
  }
};

// Function to display a story
const displayStories = (story) => {
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
};

const displayComments = (comment) => {
  const container = document.getElementById("stories");
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <h2>
    <p><strong>@${comment.by}Replying to @${
    fetchItem(comment.parent).by
  }</strong></p>
      <p>${story.text}</p>
    </h2>`;
  container.appendChild(card);
};

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

// function toggleMenu() {
//   const menu = document.getElementById("menu");
//   menu.style.display = menu.style.display === "flex" ? "none" : "flex";
// }

function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("show");
  const ham = document.getElementById("ham");
  ham.style.position = "relative";
  ham.style.zIndex = 10;
}
