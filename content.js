(function () {
  let container, timerIcon, detailsPopup, intervalId;
  let isDragging = false,
    dragOffsetX,
    dragOffsetY;
  const currentUrl = new URL(window.location.href).hostname;
  const storageKey = `screenTime_${currentUrl}`;

  function init() {
    if (!currentUrl) return; // Exit if URL is invalid

    createTimer();
    startTimer();
  }

  function createTimer() {
    if (container) return; // Avoid creating the timer multiple times

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
      fontSize: "24px",
      width: "30px",
      height: "30px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(48, 25, 52, 0.9)",
      borderRadius: "50%",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    });
    container.appendChild(timerIcon);

    detailsPopup = document.createElement("div");
    Object.assign(detailsPopup.style, {
      position: "absolute",
      top: "100%",
      right: "0",
      padding: "10px",
      backgroundColor: "rgba(48, 25, 52, 0.9)",
      color: "#e0e0e0",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      borderRadius: "5px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
      border: "1px solid #8a2be2",
      display: "none",
    });
    container.appendChild(detailsPopup);

    addEventListeners();
  }

  function addEventListeners() {
    timerIcon.addEventListener(
      "mouseenter",
      () => (detailsPopup.style.display = "block")
    );
    timerIcon.addEventListener("mouseleave", () => {
      if (!detailsPopup.contains(document.activeElement)) {
        detailsPopup.style.display = "none";
      }
    });

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
      container.style.left = `${e.clientX - dragOffsetX}px`;
      container.style.top = `${e.clientY - dragOffsetY}px`;
      container.style.right = "auto";
    }
  }

  function stopDragging() {
    isDragging = false;
  }

  function startTimer() {
    let secondsSpent = 0;

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
      try {
        localStorage.setItem(storageKey, secondsSpent.toString());
      } catch (e) {
        console.error("Error saving data to localStorage:", e);
      }
    }

    // Load initial time from localStorage
    try {
      const savedTime = localStorage.getItem(storageKey);
      if (savedTime) {
        secondsSpent = parseInt(savedTime, 10);
      }
    } catch (e) {
      console.error("Error loading data from localStorage:", e);
    }

    intervalId = setInterval(() => {
      secondsSpent++;
      updateLabel();
      saveTimeSpent();
    }, 1000);

    updateLabel();
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

  // Initialize the extension
  init();

  // Handle extension context invalidation
  window.addEventListener("beforeunload", cleanup);

  // Message handling (if needed)
  window.addEventListener("message", function (event) {
    if (event.data.action === "exitScreenTime") {
      cleanup();
    }
    if (event.data.action === "resetTimer") {
      localStorage.setItem(storageKey, "0");
    }
  });
})();
