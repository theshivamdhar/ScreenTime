document.addEventListener("DOMContentLoaded", () => {
  const websiteTimesElem = document.getElementById("website-times");
  const resetButton = document.getElementById("reset-button");
  let timeSpent = {};

  function updateTimeDisplay() {
    chrome.storage.local.get(["timeSpent"], (result) => {
      timeSpent = result.timeSpent || {};
      websiteTimesElem.innerHTML = "";

      for (const [site, time] of Object.entries(timeSpent)) {
        const siteElem = document.createElement("div");
        siteElem.className = "site-time";
        siteElem.innerHTML = `
          <strong>${site}</strong>: 
          <span class="time-display" data-site="${site}">${formatTime(
          time
        )}</span>
        `;
        websiteTimesElem.appendChild(siteElem);
      }
    });
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function saveTimeSpent() {
    chrome.storage.local.set({ timeSpent });
  }

  function resetAllTimes() {
    timeSpent = {};
    saveTimeSpent();
    updateTimeDisplay();
  }

  resetButton.addEventListener("click", resetAllTimes);

  // Update time display every second
  setInterval(() => {
    for (const site in timeSpent) {
      timeSpent[site]++;
    }
    saveTimeSpent();
    updateTimeDisplay();
  }, 1000);

  // Initial display
  updateTimeDisplay();
});
