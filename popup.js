const TIME_KEY = "timeSpentOnSite";

// Initialize the dashboard content
function updateDashboard() {
  chrome.storage.local.get(TIME_KEY, (data) => {
    const dashboardContent = document.getElementById("dashboard-content");
    dashboardContent.innerHTML = "";

    if (!data[TIME_KEY]) {
      dashboardContent.innerHTML = "<p>No data available.</p>";
      return;
    }

    for (const [domain, seconds] of Object.entries(data[TIME_KEY])) {
      const siteDiv = document.createElement("div");
      siteDiv.className = "site";
      siteDiv.innerHTML = `<h4>${domain}</h4><p>Time Spent: ${formatTime(
        seconds
      )}</p>`;
      dashboardContent.appendChild(siteDiv);
    }
  });
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

// Handle mode toggle in the popup
const modeToggleButton = document.getElementById("mode-toggle");
modeToggleButton.addEventListener("click", () => {
  chrome.storage.local.get("isDarkMode", (data) => {
    const isDarkMode = !(data.isDarkMode || false);
    chrome.storage.local.set({ isDarkMode });
    updateMode(isDarkMode);
  });
});

function updateMode(isDarkMode) {
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    modeToggleButton.textContent = "🌞";
  } else {
    document.body.classList.remove("dark-mode");
    modeToggleButton.textContent = "🌙";
  }
}

// Initialize mode on popup load
chrome.storage.local.get("isDarkMode", (data) => {
  const isDarkMode = data.isDarkMode || false;
  updateMode(isDarkMode);
});

// Update the dashboard when the popup is opened
updateDashboard();
