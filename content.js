(function () {
  // Create and style the container for the information label
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.padding = "10px";
  container.style.backgroundColor = "rgba(30, 30, 30, 0.8)";
  container.style.color = "#e0e0e0";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "14px";
  container.style.borderRadius = "5px";
  container.style.zIndex = "10000";
  container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  document.body.appendChild(container);

  // Create the information label
  const infoLabel = document.createElement("div");
  container.appendChild(infoLabel);

  // Initialize time spent variable
  let secondsSpent = 0;

  // Function to update the label with the time spent
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

  // Function to save time spent to storage
  function saveTimeSpent() {
    const currentUrl = new URL(window.location.href).hostname;
    chrome.storage.local.get(["timeSpent"], (result) => {
      const timeSpent = result.timeSpent || {};
      timeSpent[currentUrl] = (timeSpent[currentUrl] || 0) + 10;
      chrome.storage.local.set({ timeSpent });
    });
  }

  // Update the timer and save data every 10 seconds
  setInterval(() => {
    secondsSpent += 10;
    updateLabel();
    saveTimeSpent();
  }, 10000);

  // Initial label update
  updateLabel();
})();
