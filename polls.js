// Fetch the poll IDs from the API
async function fetchPollIds() {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }
  
  // Fetch the item details by itemId
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
  
  let pollIds = [];
  const pollsPerLoad = 10;
  let loadedPolls = 0;
  const collectedPolls = [];
  let isInitialLoad = true;
  
  const loadMorePolls = async () => {
    try {
      if (pollIds.length === 0) {
        pollIds = await fetchPollIds();
      }
      
      // Load polls from pollIds array
      for (
        let i = loadedPolls;
        i < (isInitialLoad ? pollsPerLoad : loadedPolls + pollsPerLoad) && i < pollIds.length;
        i++
      ) {
        const item = await fetchItem(pollIds[i]);
        if (item.type !=='poll') {
            console.log(item);
          const pollOptions = await Promise.all(item.parts.map(partId => fetchItem(partId)));
          item.options = pollOptions;
          collectedPolls.push(item);
          displayPoll(item);
          loadedPolls++;
        }
        
        // Use 5ms delay for initial load, 100ms for subsequent loads
        const delay = isInitialLoad ? 5 : 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    
    isInitialLoad = false;
    
    // Hide the "Load More" button if all polls are loaded
    if (loadedPolls >= pollIds.length) {
        document.getElementById("loadMore").style.display = "none";
    }
} catch (error) {
    console.error("Error loading more polls:", error);
}
};

// Function to display a poll
  const displayPoll = (poll) => {
    const container = document.getElementById("polls");
    const card = document.createElement("div");
    card.classList.add("card");
    const pollContent = `
      <h2>
        <a href="https://news.ycombinator.com/item?id=${poll.id}" target="_blank">
          <h3><strong>${poll.title}</strong></h3>
        </a>
        <p>By ${poll.by} on ${new Date(poll.time * 1000).toLocaleString()}</p>
        <p>Total votes: ${poll.score}</p>
      </h2>
    `;
  
    const optionsContent = `
      <div class="poll-options" style="display: none;">
        ${poll.options.map(option => `
          <div class="poll-option">
            <p>${option.text}</p>
            <p>Votes: ${option.score}</p>
          </div>
        `).join('')}
      </div>
      <button class="see-more">See options</button>
    `;
  
    card.innerHTML = pollContent + optionsContent;
  
    const seeMoreButton = card.querySelector('.see-more');
    const pollOptions = card.querySelector('.poll-options');
    
    seeMoreButton.addEventListener('click', () => {
      if (pollOptions.style.display === 'none') {
        pollOptions.style.display = 'block';
        seeMoreButton.textContent = 'Hide options';
      } else {
        pollOptions.style.display = 'none';
        seeMoreButton.textContent = 'See options';
      }
    });
  
    container.appendChild(card);
    console.log(poll);
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    loadMorePolls();
    
    // Add event listener for the Load More button
    const loadMoreButton = document.getElementById("loadMore");
    loadMoreButton.addEventListener("click", () => {
      isInitialLoad = false;
      loadMorePolls();
    });
  });