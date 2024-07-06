document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("usageChart").getContext("2d");
  const dailyUsageElem = document.getElementById("daily-usage");
  const weeklyUsageElem = document.getElementById("weekly-usage");
  const todaysUsageList = document.getElementById("todays-usage-list");
  const blockButton = document.getElementById("block-button");
  const blockUrlInput = document.getElementById("block-url");

  function renderChart(data) {
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Time Spent (seconds)",
            data: Object.values(data),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function displayUsageData() {
    chrome.storage.local.get(["timeSpent", "blockedSites"], (result) => {
      const timeSpent = result.timeSpent || {};
      const blockedSites = result.blockedSites || [];

      // Render website usage bar chart
      renderChart(timeSpent);

      // Display daily usage
      const today = new Date().toDateString();
      dailyUsageElem.innerHTML = `<h5>Today's Usage:</h5><pre>${JSON.stringify(
        timeSpent,
        null,
        2
      )}</pre>`;

      // Display weekly usage
      const weeklyUsage = {}; // Calculate weekly usage if necessary
      weeklyUsageElem.innerHTML = `<h5>Weekly Usage:</h5><pre>${JSON.stringify(
        weeklyUsage,
        null,
        2
      )}</pre>`;

      // Display today's usage
      todaysUsageList.innerHTML = `<h5>Usage Today:</h5>`;
      for (const [site, time] of Object.entries(timeSpent)) {
        const siteElem = document.createElement("div");
        siteElem.textContent = `${site}: ${Math.floor(
          time / 3600
        )}h ${Math.floor((time % 3600) / 60)}m ${time % 60}s`;
        todaysUsageList.appendChild(siteElem);
      }
    });
  }

  // Block a site
  blockButton.addEventListener("click", () => {
    const urlToBlock = blockUrlInput.value.trim();
    if (urlToBlock) {
      chrome.storage.local.get(["blockedSites"], (result) => {
        const blockedSites = result.blockedSites || [];
        if (!blockedSites.includes(urlToBlock)) {
          blockedSites.push(urlToBlock);
          chrome.storage.local.set({ blockedSites }, () => {
            alert("Website blocked!");
            blockUrlInput.value = "";
          });
        } else {
          alert("Website is already blocked!");
        }
      });
    }
  });

  // Initial display
  displayUsageData();
});
