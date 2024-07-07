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

  function createTimer() {
    if (container) return;

    container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      zIndex: "10000",
      cursor: "move",
    });
    document.body.appendChild(container);

    timerIcon = document.createElement("div");
    timerIcon.innerHTML = "⏱️";
    Object.assign(timerIcon.style, {
      fontSize: "32px",
      width: "50px",
      height: "50px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(138, 43, 226, 0.7)",
      borderRadius: "50%",
      boxShadow: "0 0 15px rgba(138, 43, 226, 0.5)",
      transition: "all 0.2s ease",
    });
    container.appendChild(timerIcon);

    detailsPopup = document.createElement("div");
    Object.assign(detailsPopup.style, {
      position: "absolute",
      top: "120%",
      right: "0",
      padding: "15px",
      backgroundColor: "rgba(48, 25, 52, 0.85)",
      color: "#e0e0e0",
      fontFamily: "Arial, sans-serif",
      fontSize: "16px",
      borderRadius: "10px",
      boxShadow: "0 0 20px rgba(138, 43, 226, 0.5)",
      border: "1px solid rgba(138, 43, 226, 0.5)",
      backdropFilter: "blur(5px)",
      display: "none",
      transition: "all 0.2s ease",
      transform: "translateY(10px)",
      opacity: "0",
      width: "200px",
    });
    container.appendChild(detailsPopup);

    addEventListeners();
    pulseAnimation();
  }

  function addEventListeners() {
    container.addEventListener("mouseenter", showDetails);
    container.addEventListener("mouseleave", hideDetails);
    container.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);
  }

  function showDetails() {
    timerIcon.style.transform = "scale(1.1)";
    timerIcon.style.boxShadow = "0 0 20px rgba(138, 43, 226, 0.8)";
    detailsPopup.style.display = "block";
    requestAnimationFrame(() => {
      detailsPopup.style.transform = "translateY(0)";
      detailsPopup.style.opacity = "1";
    });
  }

  function hideDetails() {
    timerIcon.style.transform = "scale(1)";
    timerIcon.style.boxShadow = "0 0 15px rgba(138, 43, 226, 0.5)";
    detailsPopup.style.transform = "translateY(10px)";
    detailsPopup.style.opacity = "0";
    setTimeout(() => {
      if (!detailsPopup.contains(document.activeElement)) {
        detailsPopup.style.display = "none";
      }
    }, 200);
  }

  function startDragging(e) {
    isDragging = true;
    dragOffsetX = e.clientX - container.offsetLeft;
    dragOffsetY = e.clientY - container.offsetTop;
  }

  function drag(e) {
    if (isDragging) {
      container.style.left = `${e.clientX - dragOffsetX}px`;
      container.style.top = `${e.clientY - dragOffsetY}px`;
      container.style.right = "auto";
    }
  }

  function stopDragging() {
    isDragging = false;
  }

  function pulseAnimation() {
    timerIcon.animate(
      [
        {
          transform: "scale(1)",
          boxShadow: "0 0 15px rgba(138, 43, 226, 0.5)",
        },
        {
          transform: "scale(1.05)",
          boxShadow: "0 0 20px rgba(138, 43, 226, 0.8)",
        },
        {
          transform: "scale(1)",
          boxShadow: "0 0 15px rgba(138, 43, 226, 0.5)",
        },
      ],
      {
        duration: 2000,
        iterations: Infinity,
      }
    );
  }

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
  }

  init();

  window.addEventListener("beforeunload", cleanup);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "exitScreenTime") {
      cleanup();
      isExited = true;
      chrome.storage.local.set({ screenTimeExited: true }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error setting exit status:", chrome.runtime.lastError);
        }
      });
    }
    if (request.action === "resetTimer") {
      resetTimer();
    }
  });
})();
