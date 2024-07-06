(function () {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.padding = "10px";
  container.style.backgroundColor = "rgba(48, 25, 52, 0.9)"; // Dark purple background
  container.style.color = "#e0e0e0"; // Light gray text
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "14px";
  container.style.borderRadius = "5px";
  container.style.zIndex = "10000";
  container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  container.style.border = "1px solid #8a2be2"; // Light purple border
  document.body.appendChild(container);

  const infoLabel = document.createElement("div");
  container.appendChild(infoLabel);

  let secondsSpent = 0;
  const currentUrl = new URL(window.location.href).hostname;

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
    try {
      chrome.storage.local.get(["timeSpent"], (result) => {
        const timeSpent = result.timeSpent || {};
        timeSpent[currentUrl] = secondsSpent;
        chrome.storage.local.set({ timeSpent });
      });
    } catch (error) {
      console.error("Error saving time spent:", error);
    }
  }

  // Load initial time spent
  try {
    chrome.storage.local.get(["timeSpent"], (result) => {
      const timeSpent = result.timeSpent || {};
      secondsSpent = timeSpent[currentUrl] || 0;
      updateLabel();
    });
  } catch (error) {
    console.error("Error loading initial time spent:", error);
    updateLabel(); // Update label with default value
  }

  // Update the timer every second
  const intervalId = setInterval(() => {
    try {
      secondsSpent++;
      updateLabel();
      saveTimeSpent();
    } catch (error) {
      console.error("Error updating timer:", error);
      clearInterval(intervalId); // Stop the interval if an error occurs
    }
  }, 1000);

  // Cleanup function
  function cleanup() {
    clearInterval(intervalId);
    if (document.body.contains(container)) {
      container.remove();
    }
  }

  // Listen for unload event to perform cleanup
  window.addEventListener("unload", cleanup);
})();
