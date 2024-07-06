(function () {
  // Create and style the container for the information label and mode toggle button
  const container = document.createElement("div");
  container.id = "time-tracker-container";
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.padding = "20px 30px";
  container.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  container.style.color = "white";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "24px";
  container.style.borderRadius = "15px";
  container.style.zIndex = "10000";
  container.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.5)";
  document.body.appendChild(container);

  // Create and style the information label
  const infoLabel = document.createElement("div");
  infoLabel.id = "info-label";
  infoLabel.style.marginBottom = "10px";
  container.appendChild(infoLabel);

  // Create and style the mode toggle button
  const modeToggleButton = document.createElement("button");
  modeToggleButton.id = "mode-toggle";
  modeToggleButton.textContent = "🌙";
  modeToggleButton.style.padding = "10px 20px";
  modeToggleButton.style.backgroundColor = "gray";
  modeToggleButton.style.color = "white";
  modeToggleButton.style.border = "none";
  modeToggleButton.style.borderRadius = "5px";
  modeToggleButton.style.cursor = "pointer";
  container.appendChild(modeToggleButton);

  // Create and style the drag handle
  const dragHandle = document.createElement("div");
  dragHandle.id = "drag-handle";
  dragHandle.style.width = "10px";
  dragHandle.style.height = "10px";
  dragHandle.style.backgroundColor = "white";
  dragHandle.style.borderRadius = "50%";
  dragHandle.style.position = "absolute";
  dragHandle.style.top = "10px";
  dragHandle.style.right = "10px";
  dragHandle.style.cursor = "move";
  container.appendChild(dragHandle);

  // Initialize time spent variables
  let secondsSpent = 0;
  let isDarkMode = false;

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

  // Increment the time spent every second
  const intervalId = setInterval(() => {
    secondsSpent++;
    updateLabel();
    saveTimeSpent();
  }, 1000);

  // Save the time spent to storage
  function saveTimeSpent() {
    chrome.storage.local.get({ timeSpent: {} }, (result) => {
      const timeSpent = result.timeSpent;
      timeSpent[window.location.hostname] = secondsSpent;
      chrome.storage.local.set({ timeSpent });
    });
  }

  // Load the current mode and apply it
  chrome.storage.local.get({ isDarkMode: false }, (result) => {
    isDarkMode = result.isDarkMode;
    updateMode();
  });

  // Toggle dark/light mode
  modeToggleButton.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    chrome.storage.local.set({ isDarkMode });
    updateMode();
  });

  // Update mode styling
  function updateMode() {
    document.body.classList.toggle("dark-mode", isDarkMode);
    modeToggleButton.textContent = isDarkMode ? "🌞" : "🌙";
  }

  // Drag and drop functionality
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
    });
  });

  function onMouseMove(e) {
    if (isDragging) {
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
    }
  }

  // Initial label update
  updateLabel();
})();
