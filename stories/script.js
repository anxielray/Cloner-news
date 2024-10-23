// Throttle function to prevent API request overload
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Fetch the maximum item id
async function fetchMaxItemId() {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

// Fetch an item by itemId (story, job, poll, etc.)
async function fetchItem(itemId) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${itemId}.json?print=pretty`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

// Load posts with pagination, keeping track of the last post fetched
let currentMaxId;
let loadedPosts = 0;
const postsPerLoad = 10;

const loadMorePosts = throttle(async () => {
  try {
    if (!currentMaxId) {
      currentMaxId = await fetchMaxItemId();
    }

    let postsLoaded = 0;

    for (
      let itemId = currentMaxId;
      itemId >= 0 && postsLoaded < postsPerLoad;
      itemId--
    ) {
      const item = await fetchItem(itemId);
      if (item && item.url && item.type === "story") {
        displayStory(item);
        postsLoaded++;
      }
      await new Promise((resolve) => setTimeout(resolve, 100)); // Slight delay to avoid API overload
    }

    currentMaxId -= postsLoaded;
    loadedPosts += postsLoaded;
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}, 1000); // Throttling API requests

// Display story or job post
const displayStory = (story) => {
  const container = document.getElementById("stories");
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <div>
      <h2><a href="${story.url}" target="_blank">${story.title}</a></h2>
      <p>Posted by @${story.by} on ${formatTime(story.time)}</p>
      <p>Score: ${story.score}</p>
      <button onclick="toggleComments(${story.id})">Show Comments</button>
      <div id="comments-${story.id}" style="display: none;"></div>
    </div>
  `;
  container.appendChild(card);
};

// Format timestamp to human-readable date
const formatTime = (ms) => {
  const date = new Date(ms * 1000);
  return date.toLocaleString();
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

// Fetch and display comments (including nested ones)
async function fetchComments(postId) {
  const post = await fetchItem(postId);
  if (!post.kids) return [];

  const comments = await Promise.all(
    post.kids.map(async (kidId) => {
      const comment = await fetchItem(kidId);
      comment.children = comment.kids ? await fetchComments(kidId) : [];
      return comment;
    })
  );
  return comments;
}

function displayComments(comments, parentDiv) {
  parentDiv.innerHTML = "";

  comments.forEach((comment) => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");

    const by = document.createElement("strong");
    by.innerText = `By: ${comment.by || "Anonymous"}`;

    const text = document.createElement("p");
    text.innerText = comment.text || "[Deleted]";

    commentDiv.appendChild(by);
    commentDiv.appendChild(text);
    parentDiv.appendChild(commentDiv);

    if (comment.children && comment.children.length > 0) {
      const repliesDiv = document.createElement("div");
      repliesDiv.classList.add("replies");
      displayComments(comment.children, repliesDiv);
      commentDiv.appendChild(repliesDiv);
    }
  });
}

// Generate markup for comments
function generateCommentsMarkup(comments) {
  return comments
    .map(
      (comment) => `
      <div class="comment">
        <div><strong>${comment.by || "Anonymous"}</strong>: ${
        comment.text || "[Deleted]"
      }<br>
      replied on ${formatTime(comment.time)}</div>
        ${
          comment.children.length
            ? generateCommentsMarkup(comment.children)
            : ""
        }
      </div>
    `
    )
    .join("");
}

// Live updates: Poll API every 5 seconds for new data
setInterval(async () => {
  const latestMaxId = await fetchMaxItemId();
  if (latestMaxId > currentMaxId) {
    currentMaxId = latestMaxId;
    loadMorePosts();
  }
}, 5000);

// Initial load
document.addEventListener("DOMContentLoaded", loadMorePosts);

// Load more posts on button click
const loadMoreButton = document.getElementById("loadMore");
loadMoreButton.addEventListener("click", loadMorePosts);

function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("show");
  const ham = document.getElementById("ham");
  ham.style.position = "relative";
  ham.style.zIndex = 10;
}
