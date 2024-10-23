import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchJobIds, fetchItem, loadMoreJobs, displayJob } from "../src/jobs";

// Mock the fetch function globally for testing
global.fetch = vi.fn();

// Mock data for testing
const jobIdsMock = [1, 2, 3, 4, 5];
const jobMock = {
  id: 1,
  title: "Test Job Title",
  url: "https://example.com/test-job",
  by: "test_user",
  time: 1629300000,
  text: "This is a test job description.",
};

// Mock the responses for fetch calls
fetch.mockImplementation((url) => {
  if (url.includes("jobstories.json")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(jobIdsMock),
    });
  } else if (url.includes("/item/")) {
    const itemId = url.split("/").pop().split(".")[0];
    if (itemId == jobMock.id) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(jobMock),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(null), // Mock no job found
    });
  }

  return Promise.reject(new Error("Unknown URL"));
});

// Group tests
describe("Hacker News Job API Functions", () => {
  beforeEach(() => {
    fetch.mockClear(); // Clear fetch mock history before each test
    document.body.innerHTML = `<div id="jobs"></div><button id="loadMore">Load More</button>`; // Set up DOM
  });

  // Test fetchJobIds function
  it("fetchJobIds should return an array of job IDs", async () => {
    const result = await fetchJobIds();
    expect(result).toEqual(jobIdsMock);
  });

  // Test fetchItem function
  it("fetchItem should return a job with the expected title", async () => {
    const item = await fetchItem(jobMock.id);
    expect(item).not.toBeNull();
    expect(item.title).toBe("Test Job Title");
  });

  // Test loadMoreJobs function
  it("loadMoreJobs should load jobs and update the DOM", async () => {
    await loadMoreJobs();

    const jobsContainer = document.getElementById("jobs");
    expect(jobsContainer.childElementCount).toBe(1); // One job should be loaded

    const jobCard = jobsContainer.firstChild;
    expect(jobCard).toContainHTML(
      `<h2><a href="${jobMock.url}" target="_blank"><h3><strong>${
        jobMock.title
      }</strong></h3></a><p>Posted on ${new Date(
        jobMock.time * 1000
      ).toLocaleString()}</p></h2>`
    );

    // Click the Load More button and ensure it loads more jobs
    const loadMoreButton = document.getElementById("loadMore");
    loadMoreButton.click();
    await loadMoreJobs();

    expect(jobsContainer.childElementCount).toBe(1);
  });

  // Test displayJob function
  it("displayJob should create a job card in the DOM", () => {
    displayJob(jobMock);

    const jobsContainer = document.getElementById("jobs");
    expect(jobsContainer.childElementCount).toBe(1);
    expect(jobsContainer.firstChild).toContainHTML(
      `<h2><a href="${jobMock.url}" target="_blank"><h3><strong>${
        jobMock.title
      }</strong></h3></a><p>Posted on ${new Date(
        jobMock.time * 1000
      ).toLocaleString()}</p></h2>`
    );
  });
});
