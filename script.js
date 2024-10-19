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

// Fetch the item details by itemId to cofirm existence
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
const collectedItems = [];

const loadMorePosts = async () => {
  try {
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
      if (item && !item.parent) {
        collectedItems.push(item);
        displayStories(item);
        loadedPosts++;
      }
      await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay to avoid overwhelming the API
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

      <a href="${story.url}" target="blank"><h3><strong>${
    story.title
  }</strong></h3></a>
      <p>A ${story.type} by @${story.by}</p>
      <p>Posted on ${time(story.time)}</p>
      <p>Score: ${story.score}</p>
    </h2>`;
  container.appendChild(card);
  console.log(story);
};

const time = (ms) => {
  const date = new Date(ms);
  return date.toLocaleString();
};

document.addEventListener("DOMContentLoaded", () => {
loadMorePosts();
});

// Load more posts on button click
const loadMoreButton = document.getElementById("loadMore");
loadMoreButton.addEventListener("click", loadMorePosts);
