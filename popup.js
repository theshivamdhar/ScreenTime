document.addEventListener("DOMContentLoaded", () => {
  const websiteTimesElem = document.getElementById("website-times");
  const exitButton = document.getElementById("exit-button");

  function updateTimeDisplay() {
    try {
      chrome.storage.local.get(null, (items) => {
        websiteTimesElem.innerHTML = "";
        for (const [key, time] of Object.entries(items)) {
          if (key.startsWith("screenTime_")) {
            const site = key.replace("screenTime_", "");
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
        }
      });
    } catch (error) {
      console.error("Error updating time display:", error);
      // Fallback to localStorage if chrome.storage fails
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("screenTime_")) {
          const site = key.replace("screenTime_", "");
          const time = parseInt(localStorage.getItem(key) || "0");
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
      }
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
  const updateInterval = setInterval(updateTimeDisplay, 1000);

  // Initial display
  updateTimeDisplay();

  // Exit ScreenTime functionality
  exitButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: "exitScreenTime" });
    });
    window.close(); // Close the popup
  });

  // Reset all timers
  resetAllButton.addEventListener("click", () => {
    resetAllTimers();
    window.close(); // Close the popup
  });

  // Cleanup function
  function cleanup() {
    clearInterval(updateInterval);
  }

  // Listen for unload event to perform cleanup
  window.addEventListener("unload", cleanup);
});
