(function () {
  let container, infoLabel, intervalId;
  const currentUrl = new URL(window.location.href).hostname;
  const storageKey = `screenTime_${currentUrl}`;

  function createTimer() {
    container = document.createElement("div");
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

    infoLabel = document.createElement("div");
    container.appendChild(infoLabel);
  }

  function startTimer() {
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
      chrome.storage.local.set({ [storageKey]: secondsSpent });
    }

    // Update the timer every second
    intervalId = setInterval(() => {
      secondsSpent++;
      updateLabel();
      saveTimeSpent();
    }, 1000);

    // Initial update
    updateLabel();
  }

  function cleanup() {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (container && document.body.contains(container)) {
      container.remove();
    }
  }

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "exitScreenTime") {
      cleanup();
    } else if (request.action === "resetTimer") {
      localStorage.setItem(storageKey, "0");
      chrome.storage.local.set({ [storageKey]: 0 }, () => {
        cleanup();
        createTimer();
        startTimer();
      });
    }
  });

  // Listen for unload event to perform cleanup
  window.addEventListener("unload", cleanup);

  // Initialize the timer
  createTimer();
  startTimer();
})();
