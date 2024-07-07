document.addEventListener("DOMContentLoaded", () => {
  const websiteTimesElem = document.getElementById("website-times");
  const exitButton = document.getElementById("exit-button");
  const resetButton = document.getElementById("reset-button");
  let updateInterval;

  function updateTimeDisplay() {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving data:", chrome.runtime.lastError);
        return;
      }

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

  function resetAllTimers() {
    const loadingSpinner = document.createElement("span");
    loadingSpinner.className = "loading";
    resetButton.appendChild(loadingSpinner);
    resetButton.disabled = true;

    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving data:", chrome.runtime.lastError);
        resetButton.removeChild(loadingSpinner);
        resetButton.disabled = false;
        return;
      }

      const resetItems = {};
      for (const key in items) {
        if (key.startsWith("screenTime_")) {
          resetItems[key] = 0;
        }
      }

      chrome.storage.local.set(resetItems, () => {
        if (chrome.runtime.lastError) {
          console.error("Error resetting timers:", chrome.runtime.lastError);
        } else {
          updateTimeDisplay();
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { action: "resetTimer" });
            }
          });
        }
        resetButton.removeChild(loadingSpinner);
        resetButton.disabled = false;
      });
    });
  }

  function exitScreenTime() {
    chrome.runtime.sendMessage({ action: "exitScreenTime" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error exiting ScreenTime:", chrome.runtime.lastError);
      } else if (response && response.success) {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (
              tab.url.startsWith("http://") ||
              tab.url.startsWith("https://")
            ) {
              chrome.tabs.sendMessage(tab.id, { action: "exitScreenTime" });
            }
          });
        });
        window.close();
      } else {
        console.error(
          "Failed to exit ScreenTime:",
          response ? response.error : "Unknown error"
        );
      }
    });
  }

  function init() {
    updateInterval = setInterval(updateTimeDisplay, 1000);
    updateTimeDisplay();

    resetButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all timers?")) {
        resetAllTimers();
      }
    });

    exitButton.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to exit ScreenTime? This will clear all data."
        )
      ) {
        exitScreenTime();
      }
    });
  }

  function cleanup() {
    clearInterval(updateInterval);
  }

  init();
  window.addEventListener("unload", cleanup);
});
