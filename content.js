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
      opacity: "0",
      width: "max-content",
      maxWidth: "300px",
      wordWrap: "break-word",
    });
    container.appendChild(detailsPopup);

    positionTimerWithinViewport();
    addEventListeners();
    pulseAnimation();
  }

  function positionTimerWithinViewport() {
    const padding = 20; // Increased padding from the edge of the viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const containerWidth = 50; // Width of the timer icon
    const containerHeight = 50; // Height of the timer icon

    // Calculate the maximum allowed positions
    const maxLeft = viewportWidth - containerWidth - padding;
    const maxTop = viewportHeight - containerHeight - padding;

    // Set initial position (top-right corner with increased padding)
    let left = maxLeft;
    let top = padding;

    // Ensure the container stays within the viewport bounds
    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
  }

  function addEventListeners() {
    container.addEventListener("mouseenter", showDetails);
    container.addEventListener("mouseleave", hideDetails);
    container.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);
    window.addEventListener("resize", positionTimerWithinViewport);
  }

  function showDetails() {
    timerIcon.style.transform = "scale(1.1)";
    timerIcon.style.boxShadow = "0 0 20px rgba(138, 43, 226, 0.8)";
    detailsPopup.style.display = "block";
    requestAnimationFrame(() => {
      detailsPopup.style.transform = "translateY(0)";
      detailsPopup.style.opacity = "1";
    });
    adjustPopupPosition();
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

  function adjustPopupPosition() {
    const containerRect = container.getBoundingClientRect();
    const popupRect = detailsPopup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (containerRect.right + popupRect.width > viewportWidth) {
      detailsPopup.style.right = "100%";
      detailsPopup.style.left = "auto";
    } else {
      detailsPopup.style.left = "100%";
      detailsPopup.style.right = "auto";
    }

    if (containerRect.bottom + popupRect.height > viewportHeight) {
      detailsPopup.style.bottom = "0";
      detailsPopup.style.top = "auto";
    } else {
      detailsPopup.style.top = "0";
      detailsPopup.style.bottom = "auto";
    }
  }

  function startDragging(e) {
    isDragging = true;
    dragOffsetX = e.clientX - container.offsetLeft;
    dragOffsetY = e.clientY - container.offsetTop;
  }

  function drag(e) {
    if (isDragging) {
      const padding = 10;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      let newLeft = e.clientX - dragOffsetX;
      let newTop = e.clientY - dragOffsetY;

      newLeft = Math.max(
        padding,
        Math.min(newLeft, viewportWidth - containerWidth - padding)
      );
      newTop = Math.max(
        padding,
        Math.min(newTop, viewportHeight - containerHeight - padding)
      );

      container.style.left = `${newLeft}px`;
      container.style.top = `${newTop}px`;
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
      if (intervalId) {
      clearInterval(intervalId);
    }
    startTimer();
  }
});
