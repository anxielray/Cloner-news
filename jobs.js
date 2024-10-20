// Fetch the job IDs from the jobstories API
async function fetchJobIds() {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/jobstories.json?print=pretty"
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
  
  let jobIds = [];
  const jobsPerLoad = 10;
  let loadedJobs = 0;
  const collectedJobs = [];
  let isInitialLoad = true;
  
  const loadMoreJobs = async () => {
    try {
      if (jobIds.length === 0) {
        jobIds = await fetchJobIds();
      }
      
      // Load jobs from jobIds array
      for (
        let i = loadedJobs;
        i < (isInitialLoad ? jobsPerLoad : loadedJobs + jobsPerLoad) && i < jobIds.length;
        i++
      ) {
        const job = await fetchItem(jobIds[i]);
        if (job) {
          collectedJobs.push(job);
          displayJob(job);
          loadedJobs++;
        }
        
        // Use 5ms delay for initial load, 100ms for subsequent loads
        const delay = isInitialLoad ? 5 : 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      
      isInitialLoad = false;
  
      // Hide the "Load More" button if all jobs are loaded
      if (loadedJobs >= jobIds.length) {
        document.getElementById("loadMore").style.display = "none";
      }
    } catch (error) {
      console.error("Error loading more jobs:", error);
    }
  };
  
  // Function to display a job
  const displayJob = (job) => {
    const container = document.getElementById("jobs");
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h2>
        <a href="${job.url || `https://news.ycombinator.com/item?id=${job.id}`}" target="_blank">
          <h3><strong>${job.title}</strong></h3>
        </a>
        <p>Posted on ${new Date(job.time * 1000).toLocaleString()}</p>
      </h2>
      ${job.text ? `<p>${job.text}</p>` : ''}
    `;
    container.appendChild(card);
    console.log(job);
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    loadMoreJobs();
    
    // Add event listener for the Load More button
    const loadMoreButton = document.getElementById("loadMore");
    loadMoreButton.addEventListener("click", () => {
      isInitialLoad = false;
      loadMoreJobs();
    });
  });