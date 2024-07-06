(function () {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.padding = "10px";
  container.style.backgroundColor = "rgba(48, 25, 52, 0.9)";
  container.style.color = "#e0e0e0";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "14px";
  container.style.borderRadius = "5px";
  container.style.zIndex = "10000";
  container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  container.style.border = "1px solid #8a2be2";
  document.body.appendChild(container);

  const infoLabel = document.createElement("div");
  container.appendChild(infoLabel);

  const currentUrl = new URL(window.location.href).hostname;
  const storageKey = `screenTime_${currentUrl}`;

  let secondsSpent = parseInt(localStorage.getItem(storageKey) || "0");

  function updateLabel() {
    const hours = Math.floor(secondsSpent / 3600);
    const minutes = Math.floor((secondsSpent % 3600) / 60);
    const seconds = secondsSpent % 60;
    infoLabel.textContent = `Time spent on this site: ${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function saveTimeSpent() {
    localStorage.setItem(storageKey, secondsSpent.toString());
    try {
      chrome.storage.local.set({ [storageKey]: secondsSpent });
    } catch (error) {
      console.error("Error saving to chrome.storage:", error);
    }
  }

  function syncWithChromeStorage() {
    try {
      chrome.storage.local.get([storageKey], (result) => {
        const storedTime = result[storageKey];
        if (storedTime !== undefined && storedTime > secondsSpent) {
          secondsSpent = storedTime;
          updateLabel();
        }
      });
    } catch (error) {
      console.error("Error syncing with chrome.storage:", error);
    }
  }

  // Update the timer every second
  const intervalId = setInterval(() => {
    secondsSpent++;
    updateLabel();
    saveTimeSpent();
  }, 1000);

  // Sync with chrome.storage every minute
  const syncIntervalId = setInterval(syncWithChromeStorage, 60000);

  // Initial update
  updateLabel();
  syncWithChromeStorage();

  function cleanup() {
    clearInterval(intervalId);
    clearInterval(syncIntervalId);
    if (document.body.contains(container)) {
      container.remove();
    }
  }

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "exitScreenTime") {
      cleanup();
    }
  });

  // Listen for unload event to perform cleanup
  window.addEventListener("unload", cleanup);
})();
