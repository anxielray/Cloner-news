// Fetch the poll IDs from the API
async function fetchPollIds() {
    try {
      const response = await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch poll IDs: HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching poll IDs:", error);
      return null; // Return null to indicate failure
    }
  }
  
  // Fetch the item details by itemId
  async function fetchItem(itemId) {
    try {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${itemId}.json?print=pretty`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch item ${itemId}: HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error);
      return null; // Return null if fetching the item fails
    }
  }
  
  let pollIds = [];
  const pollsPerLoad = 10;
  let loadedPolls = 0;
  const collectedPolls = [];
  let isInitialLoad = true;
  
  const loadMorePolls = async () => {
    try {
      // Fetch poll IDs if not already fetched
      if (pollIds.length === 0) {
        pollIds = await fetchPollIds();
        if (!pollIds) {
          displayError("Failed to load polls. Please try again later.");
          return; // Exit if poll IDs couldn't be fetched
        }
      }
  
      // Load polls from pollIds array
      for (
        let i = loadedPolls;
        i < (isInitialLoad ? pollsPerLoad : loadedPolls + pollsPerLoad) && i < pollIds.length;
        i++
      ) {
        const item = await fetchItem(pollIds[i]);
        
        // Ensure the item is a poll and has poll options
        if (item && item.type === 'poll' && item.parts) {
          const pollOptions = await Promise.all(item.parts.map(partId => fetchItem(partId)));
          
          // Only proceed if poll options were successfully fetched
          if (pollOptions && pollOptions.length > 0) {
            item.options = pollOptions;
            collectedPolls.push(item);
            displayPoll(item);
            loadedPolls++;
          } else {
            console.warn(`Poll ${itemId} does not have valid options.`);
          }
        } else {
          console.warn(`Item ${pollIds[i]} is not a valid poll or missing options.`);
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
      displayError("An error occurred while loading polls. Please try again.");
    }
  };
  
  // Function to display error messages
  function displayError(message) {
    const container = document.getElementById("polls");
    const errorMessage = document.createElement("p");
    errorMessage.classList.add("error-message");
    errorMessage.textContent = message;
    container.appendChild(errorMessage);
  }
  
  // Function to display a poll
  const displayPoll = (poll) => {
    const container = document.getElementById("polls");
    const card = document.createElement("div");
    card.classList.add("card");
    
    const pollContent = `
      <h2>
        <a href="https://news.ycombinator.com/item?id=${poll.id}" target="_blank">
          <h3><strong>${poll.title || 'No Title Available'}</strong></h3>
        </a>
        <p>By ${poll.by} on ${new Date(poll.time * 1000).toLocaleString()}</p>
        <p>Total votes: ${poll.score || 'N/A'}</p>
      </h2>
    `;
  
    const optionsContent = poll.options && poll.options.length > 0 ? `
      <div class="poll-options" style="display: none;">
        ${poll.options.map(option => `
          <div class="poll-option">
            <p>${option.text || 'No text available'}</p>
            <p>Votes: ${option.score || 'N/A'}</p>
          </div>
        `).join('')}
      </div>
      <button class="see-more">See options</button>
    ` : '<p>No poll options available.</p>';
  
    card.innerHTML = pollContent + optionsContent;
  
    if (poll.options && poll.options.length > 0) {
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
    }
  
    container.appendChild(card);
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
  