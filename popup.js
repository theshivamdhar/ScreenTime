document.addEventListener("DOMContentLoaded", () => {
  const websiteTimesElem = document.getElementById("website-times");
  const exitButton = document.getElementById("exit-button");
  const resetButton = document.getElementById("reset-button");

  function updateTimeDisplay() {
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
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function clearAllData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        const keysToRemove = Object.keys(items).filter((key) =>
          key.startsWith("screenTime_")
        );
        chrome.storage.local.remove(keysToRemove, resolve);
      });
    });
  }

  // Update time display every second
  const updateInterval = setInterval(updateTimeDisplay, 1000);

  // Initial display
  updateTimeDisplay();

  // Reset All Timers functionality
  resetButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all timers?")) {
      chrome.storage.local.get(null, (items) => {
        const resetItems = {};
        for (const key in items) {
          if (key.startsWith("screenTime_")) {
            resetItems[key] = 0;
          }
        }
        chrome.storage.local.set(resetItems, () => {
          updateTimeDisplay();
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                  chrome.runtime.sendMessage({ action: "resetTimer" });
                },
              });
            });
          });
        });
      });
    }
  });

  // Exit ScreenTime functionality
  exitButton.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to exit ScreenTime? This will clear all data."
      )
    ) {
      clearAllData().then(() => {
        chrome.runtime.sendMessage({ action: "exitScreenTime" });
        window.close();
      });
    }
  });

  // Cleanup function
  function cleanup() {
    clearInterval(updateInterval);
  }

  // Listen for unload event to perform cleanup
  window.addEventListener("unload", cleanup);
});
