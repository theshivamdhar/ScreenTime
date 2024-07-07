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
      fontSize: "32px",
      width: "50px",
      height: "50px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(138, 43, 226, 0.7)",
      borderRadius: "50%",
      boxShadow: "0 0 15px rgba(138, 43, 226, 0.5)",
      transition: "all 0.3s ease",
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
      transition: "all 0.3s ease",
      transform: "translateY(10px)",
      opacity: "0",
    });
    container.appendChild(detailsPopup);

    addEventListeners();
    pulseAnimation();
  }

  function addEventListeners() {
    timerIcon.addEventListener("mouseenter", () => {
      timerIcon.style.transform = "scale(1.1)";
      timerIcon.style.boxShadow = "0 0 20px rgba(138, 43, 226, 0.8)";
      detailsPopup.style.display = "block";
      setTimeout(() => {
        detailsPopup.style.transform = "translateY(0)";
        detailsPopup.style.opacity = "1";
      }, 50);
    });

    timerIcon.addEventListener("mouseleave", () => {
      timerIcon.style.transform = "scale(1)";
      timerIcon.style.boxShadow = "0 0 15px rgba(138, 43, 226, 0.5)";
    });

    container.addEventListener("mouseleave", () => {
      detailsPopup.style.transform = "translateY(10px)";
      detailsPopup.style.opacity = "0";
      setTimeout(() => {
        if (!detailsPopup.contains(document.activeElement)) {
          detailsPopup.style.display = "none";
        }
      }, 300);
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
