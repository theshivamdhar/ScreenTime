// Create a function to update time dynamically
function updateDynamicTime() {
  let timerLabel = document.createElement("div");
  timerLabel.id = "screen-time-timer";
  document.body.appendChild(timerLabel);

  function updateTime() {
    chrome.runtime.sendMessage({ action: "getTimerData" }, (response) => {
      let domain = window.location.hostname;
      let timeSpent = response[domain] ? response[domain].timeSpent : 0;
      timerLabel.textContent = `Time spent: ${formatTime(timeSpent)}`;
    });
  }

  function formatTime(seconds) {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  updateTime();
  setInterval(updateTime, 1000); // Update every second
}

updateDynamicTime();
