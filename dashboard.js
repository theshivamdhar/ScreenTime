function updateDashboard() {
  chrome.runtime.sendMessage({ action: "getTimerData" }, (response) => {
    let total = 0;

    for (let domain in response) {
      total += response[domain].timeSpent;
    }

    // Update total time spent
    document.getElementById(
      "total-time"
    ).innerHTML = `<strong>Total Time Spent:</strong> ${formatTime(total)}`;

    // Example daily and weekly usage data (for demonstration purposes)
    document.getElementById("daily-usage").innerHTML =
      "<strong>Daily Usage:</strong> Not Implemented";
    document.getElementById("weekly-usage").innerHTML =
      "<strong>Weekly Usage:</strong> Not Implemented";

    // Update time spent wheel
    updateTimeWheel(total);
  });
}

function formatTime(seconds) {
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

function updateTimeWheel(totalSeconds) {
  let percentage = (totalSeconds / (24 * 3600)) * 100; // Assuming 24 hours for full circle
  let wheelText = document.getElementById("time-wheel-text");
  wheelText.textContent = `${percentage.toFixed(2)}%`;
}

updateDashboard();
setInterval(updateDashboard, 10000); // Update every 10 seconds
