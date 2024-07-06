document.addEventListener("DOMContentLoaded", () => {
  const websiteTimesElem = document.getElementById("website-times");

  function updateTimeDisplay() {
    try {
      chrome.storage.local.get(["timeSpent"], (result) => {
        const timeSpent = result.timeSpent || {};
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
    } catch (error) {
      console.error("Error updating time display:", error);
    }
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Update time display every second
  const updateInterval = setInterval(() => {
    try {
      chrome.storage.local.get(["timeSpent"], (result) => {
        const timeSpent = result.timeSpent || {};
        for (const [site, time] of Object.entries(timeSpent)) {
          const display = document.querySelector(
            `.time-display[data-site="${site}"]`
          );
          if (display) {
            display.textContent = formatTime(time);
          }
        }
      });
    } catch (error) {
      console.error("Error updating times:", error);
      clearInterval(updateInterval);
    }
  }, 1000);

  // Initial display
  updateTimeDisplay();

  // Refresh data every 10 seconds to catch any new sites
  const refreshInterval = setInterval(updateTimeDisplay, 10000);

  // Cleanup function
  function cleanup() {
    clearInterval(updateInterval);
    clearInterval(refreshInterval);
  }

  // Listen for unload event to perform cleanup
  window.addEventListener("unload", cleanup);
});
