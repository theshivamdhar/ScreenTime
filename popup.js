const TIME_KEY = "timeSpent";

// Initialize the dashboard content
function updateDashboard() {
  chrome.storage.local.get({ timeSpent: {} }, (result) => {
    const dashboardContent = document.getElementById("dashboard-content");
    dashboardContent.innerHTML = "";

    const timeSpent = result.timeSpent;
    if (Object.keys(timeSpent).length === 0) {
      dashboardContent.innerHTML = "<p>No data available.</p>";
      return;
    }

    for (const [domain, seconds] of Object.entries(timeSpent)) {
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

// Update the dashboard when the popup is opened
updateDashboard();
