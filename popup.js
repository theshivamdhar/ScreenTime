document.addEventListener("DOMContentLoaded", () => {
  const websiteTimesElem = document.getElementById("website-times");

  // Function to update time display dynamically
  function updateTimeDisplay() {
    chrome.storage.local.get(["timeSpent"], (result) => {
      const timeSpent = result.timeSpent || {};
      websiteTimesElem.innerHTML = "";

      for (const [site, time] of Object.entries(timeSpent)) {
        const siteElem = document.createElement("div");
        siteElem.className = "site-time";
        siteElem.innerHTML = `
                    <strong>${site}</strong>: 
                    <span class="time-display" data-site="${site}">${formatTime(
          time
        )}</span>
                `;
        websiteTimesElem.appendChild(siteElem);

        // Update time display every second
        setInterval(() => {
          const siteElement = document.querySelector(
            `.time-display[data-site="${site}"]`
          );
          if (siteElement) {
            const currentTime = parseTime(siteElement.textContent);
            siteElement.textContent = formatTime(currentTime + 1);
            timeSpent[site] = currentTime + 1;
            saveTimeSpent();
          }
        }, 1000);
      }
    });
  }

  // Function to format time as hh:mm:ss
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Function to parse time from hh:mm:ss format to seconds
  function parseTime(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Save updated timeSpent to storage
  function saveTimeSpent() {
    chrome.storage.local.set({ timeSpent });
  }

  // Initial display
  updateTimeDisplay();
});
