(function () {
  let container, timerIcon, detailsPopup, intervalId;
  let isDragging = false,
    dragOffsetX,
    dragOffsetY;
  let secondsSpent = 0;
  const currentUrl = new URL(window.location.href).hostname;
  const storageKey = `screenTime_${currentUrl}`;
  let isExited = false;

  function init() {
    if (!currentUrl) return;

    chrome.storage.local.get("screenTimeExited", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error checking exit status:", chrome.runtime.lastError);
        return;
      }

      if (result.screenTimeExited) {
        isExited = true;
        return;
      }
      createTimer();
      startTimer();
    });
  }

  // ... (rest of the existing functions remain the same)

  function startTimer() {
    chrome.storage.local.get(storageKey, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving time data:", chrome.runtime.lastError);
        return;
      }
      if (result[storageKey]) {
        secondsSpent = parseInt(result[storageKey], 10);
      }
      updateLabel();
    });

    intervalId = setInterval(() => {
      secondsSpent++;
      updateLabel();
      saveTimeSpent();
      syncTime();
    }, 1000);
  }

  function updateLabel() {
    const hours = Math.floor(secondsSpent / 3600);
    const minutes = Math.floor((secondsSpent % 3600) / 60);
    const seconds = secondsSpent % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    detailsPopup.innerHTML = `
      <strong>Time spent on ${currentUrl}:</strong><br>
      <span style="font-size: 20px; color: #a64dff;">${timeString}</span>
    `;
  }

  function saveTimeSpent() {
    chrome.storage.local.set({ [storageKey]: secondsSpent }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving time data:", chrome.runtime.lastError);
      }
    });
  }

  function syncTime() {
    chrome.runtime.sendMessage({
      action: "syncTime",
      url: window.location.href,
      time: secondsSpent,
    });
  }

  function cleanup() {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (container && document.body.contains(container)) {
      container.remove();
    }
    container = null;
  }

  function resetTimer() {
    secondsSpent = 0;
    updateLabel();
    saveTimeSpent();
    syncTime();
  }

  init();

  window.addEventListener("beforeunload", cleanup);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "exitScreenTime") {
      cleanup();
      isExited = true;
      chrome.storage.local.remove(storageKey, () => {
        if (chrome.runtime.lastError) {
          console.error("Error removing time data:", chrome.runtime.lastError);
        }
      });
    }
    if (request.action === "resetTimer") {
      resetTimer();
    }
  });
})();
