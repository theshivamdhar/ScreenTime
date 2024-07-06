document.getElementById("set-limit").addEventListener("click", () => {
  let site = document.getElementById("site").value;
  let limit = parseInt(document.getElementById("limit").value) * 60; // Convert minutes to seconds
  if (site && limit) {
    chrome.runtime.sendMessage(
      { action: "setSiteLimits", data: { [site]: limit } },
      () => {
        alert("Limit set for " + site);
      }
    );
  }
});

function updateUsageData() {
  chrome.runtime.sendMessage({ action: "getTimerData" }, (response) => {
    let dailyUsage = document.getElementById("daily-usage");
    let weeklyUsage = document.getElementById("weekly-usage");
    dailyUsage.innerHTML = "<h3>Daily Usage</h3>";
    weeklyUsage.innerHTML = "<h3>Weekly Usage</h3>";

    for (let domain in response) {
      let timeSpent = response[domain].timeSpent;
      let timeString = formatTime(timeSpent);
      dailyUsage.innerHTML += `<p>${domain}: ${timeString}</p>`;
    }
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

updateUsageData();
setInterval(updateUsageData, 10000); // Update every 10 seconds
