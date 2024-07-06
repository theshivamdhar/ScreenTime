(function () {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.padding = "10px";
  container.style.backgroundColor = "rgba(30, 30, 30, 0.8)";
  container.style.color = "##e0e0e0";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "14px";
  container.style.borderRadius = "5px";
  container.style.zIndex = "10000";
  container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
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
    chrome.storage.local.get(["timeSpent"], (result) => {
      const timeSpent = result.timeSpent || {};
      timeSpent[currentUrl] = secondsSpent;
      chrome.storage.local.set({ timeSpent });
    });
  }

  // Load initial time spent
  chrome.storage.local.get(["timeSpent"], (result) => {
    const timeSpent = result.timeSpent || {};
    secondsSpent = timeSpent[currentUrl] || 0;
    updateLabel();
  });

  // Update the timer every second
  setInterval(() => {
    secondsSpent++;
    updateLabel();
    saveTimeSpent();
  }, 1000);
})();
