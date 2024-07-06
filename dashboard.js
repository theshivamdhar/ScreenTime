function updateDashboard() {
  chrome.storage.local.get("timeSpentOnSite", (data) => {
    const dashboardContent = document.getElementById("dashboard-content");
    dashboardContent.innerHTML = "";

    if (!data.timeSpentOnSite) {
      dashboardContent.innerHTML = "<p>No data available.</p>";
      return;
    }

    for (const [domain, seconds] of Object.entries(data.timeSpentOnSite)) {
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

updateDashboard();
