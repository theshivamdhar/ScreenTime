(function () {
  let container,
    timerIcon,
    detailsPopup,
    isDragging = false,
    dragOffsetX,
    dragOffsetY;
  const currentUrl = new URL(window.location.href).hostname;
  const storageKey = `screenTime_${currentUrl}`;

  function createTimer() {
    container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.zIndex = "10000";
    container.style.cursor = "move";
    document.body.appendChild(container);

    timerIcon = document.createElement("div");
    timerIcon.innerHTML = "⏱️";
    timerIcon.style.fontSize = "24px";
    timerIcon.style.width = "30px";
    timerIcon.style.height = "30px";
    timerIcon.style.display = "flex";
    timerIcon.style.justifyContent = "center";
    timerIcon.style.alignItems = "center";
    timerIcon.style.backgroundColor = "rgba(48, 25, 52, 0.9)";
    timerIcon.style.borderRadius = "50%";
    timerIcon.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    container.appendChild(timerIcon);

    detailsPopup = document.createElement("div");
    detailsPopup.style.position = "absolute";
    detailsPopup.style.top = "100%";
    detailsPopup.style.right = "0";
    detailsPopup.style.padding = "10px";
    detailsPopup.style.backgroundColor = "rgba(48, 25, 52, 0.9)";
    detailsPopup.style.color = "#e0e0e0";
    detailsPopup.style.fontFamily = "Arial, sans-serif";
    detailsPopup.style.fontSize = "14px";
    detailsPopup.style.borderRadius = "5px";
    detailsPopup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    detailsPopup.style.border = "1px solid #8a2be2";
    detailsPopup.style.display = "none";
    container.appendChild(detailsPopup);

    // Hover functionality
    timerIcon.addEventListener("mouseenter", () => {
      detailsPopup.style.display = "block";
    });

    timerIcon.addEventListener("mouseleave", () => {
      if (!detailsPopup.contains(document.activeElement)) {
        detailsPopup.style.display = "none";
      }
    });

    // Click functionality
    timerIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      detailsPopup.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        detailsPopup.style.display = "none";
      }
    });

    // Dragging functionality
    container.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDragging);
  }

  function startDragging(e) {
    isDragging = true;
    dragOffsetX = e.clientX - container.offsetLeft;
    dragOffsetY = e.clientY - container.offsetTop;
  }

  function drag(e) {
    if (isDragging) {
      container.style.left = e.clientX - dragOffsetX + "px";
      container.style.top = e.clientY - dragOffsetY + "px";
      container.style.right = "auto";
    }
  }

  function stopDragging() {
    isDragging = false;
  }

  function startTimer() {
    let secondsSpent = parseInt(localStorage.getItem(storageKey) || "0");

    function updateLabel() {
      const hours = Math.floor(secondsSpent / 3600);
      const minutes = Math.floor((secondsSpent % 3600) / 60);
      const seconds = secondsSpent % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      detailsPopup.textContent = `Time spent on ${currentUrl}: ${timeString}`;
    }

    function saveTimeSpent() {
      localStorage.setItem(storageKey, secondsSpent.toString());
      chrome.storage.local.set({ [storageKey]: secondsSpent });
    }

    // Update the timer every second
    const intervalId = setInterval(() => {
      secondsSpent++;
      updateLabel();
      saveTimeSpent();
    }, 1000);

    // Initial update
    updateLabel();

    return intervalId;
  }

  function cleanup() {
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
