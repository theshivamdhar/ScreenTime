function updateDashboard() {
  chrome.runtime.sendMessage({ action: "getTimerData" }, (response) => {
    let total = 0;
    let daily = {};
    let weekly = {};

    for (let domain in response) {
      total += response[domain].timeSpent;

      // Example daily and weekly data
      daily[domain] = Math.floor(Math.random() * 3600); // Random data for example
      weekly[domain] = Math.floor(Math.random() * 3600); // Random data for example
    }

    // Update total time spent
    document.getElementById(
      "total-time"
    ).innerHTML = `<strong>Total Time Spent:</strong> ${formatTime(total)}`;

    // Update daily usage
    let dailyUsage = document.getElementById("daily-usage");
    dailyUsage.innerHTML = "<strong>Daily Usage:</strong>";
    for (let domain in daily) {
      dailyUsage.innerHTML += `<p>${domain}: ${formatTime(daily[domain])}</p>`;
    }

    // Update weekly usage
    let weeklyUsage = document.getElementById("weekly-usage");
    weeklyUsage.innerHTML = "<strong>Weekly Usage:</strong>";
    for (let domain in weekly) {
      weeklyUsage.innerHTML += `<p>${domain}: ${formatTime(
        weekly[domain]
      )}</p>`;
    }

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
