const TIME_KEY = "timeSpentOnSite";

// Create and style the timer label
const timerLabel = document.createElement("div");
timerLabel.id = "time-tracker-label";
document.body.appendChild(timerLabel);

// Create and style the mode toggle button
const modeToggleButton = document.createElement("button");
modeToggleButton.id = "mode-toggle";
modeToggleButton.textContent = "🌙";
document.body.appendChild(modeToggleButton);

// Create a div to hold the timer
const timerWrapper = document.createElement("div");
timerWrapper.id = "timer-wrapper";
timerWrapper.appendChild(timerLabel);
document.body.appendChild(timerWrapper);

// Initialize storage and timer
const domain = window.location.hostname;
let startTime = Date.now();
let isDarkMode = false;

// Update time in storage
function updateTime() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  chrome.storage.local.get(TIME_KEY, (data) => {
    const existingTime = data[TIME_KEY] || {};
    existingTime[domain] = elapsed;
    chrome.storage.local.set({ [TIME_KEY]: existingTime });
    displayTime(elapsed);
  });
}

// Format time as hh:mm:ss
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

// Display time in the label
function displayTime(seconds) {
  timerLabel.textContent = `Time spent: ${formatTime(seconds)}`;
}

// Start the timer
updateTime();
setInterval(updateTime, 10000); // Update every 10 seconds

// Handle mode toggle
modeToggleButton.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  chrome.storage.local.set({ isDarkMode });
  updateMode();
});

function updateMode() {
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    modeToggleButton.textContent = "🌞";
  } else {
    document.body.classList.remove("dark-mode");
    modeToggleButton.textContent = "🌙";
  }
}

// Handle drag and drop for the timer
let isDragging = false;

timerLabel.addEventListener("mousedown", (e) => {
  isDragging = true;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
  });
});

function onMouseMove(e) {
  if (isDragging) {
    timerLabel.style.left = `${e.pageX - timerLabel.offsetWidth / 2}px`;
    timerLabel.style.top = `${e.pageY - timerLabel.offsetHeight / 2}px`;
  }
}

// Initialize mode on page load
chrome.storage.local.get("isDarkMode", (data) => {
  isDarkMode = data.isDarkMode || false;
  updateMode();
});
