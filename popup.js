document.addEventListener("DOMContentLoaded", () => {
  const websiteTimesElem = document.getElementById("website-times");

  function updateTimeDisplay() {
    chrome.storage.local.get(["timeSpent"], (result) => {
      const timeSpent = result.timeSpent || {};
      websiteTimesElem.innerHTML = "";

      for (const [site, time] of Object.entries(timeSpent)) {
        const siteElem = document.createElement("div");
        siteElem.className = "site-time";
        siteElem.innerHTML = `
          <strong>${site}</strong>: 
          <span class="time-display" data-site="${site}" data-time="${time}">${formatTime(
          time
        )}</span>
        `;
        websiteTimesElem.appendChild(siteElem);
      }
    });
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Update time display every second
  setInterval(() => {
    const timeDisplays = document.querySelectorAll(".time-display");
    timeDisplays.forEach((display) => {
      let time = parseInt(display.getAttribute("data-time")) + 1;
      display.setAttribute("data-time", time);
      display.textContent = formatTime(time);
    });
  }, 1000);

  // Initial display
  updateTimeDisplay();

  // Refresh data every 10 seconds
  setInterval(updateTimeDisplay, 10000);
});
