let timerData = {};
let siteLimits = {};

// Start tracking time for the active tab
function startTracking(url) {
  let domain = new URL(url).hostname;

  if (!timerData[domain]) {
    timerData[domain] = { timeSpent: 0 };
  }

  // Update timer every second
  setInterval(() => {
    if (timerData[domain]) {
      timerData[domain].timeSpent++;
      chrome.storage.local.set({ timerData });
      checkSiteLimit(domain);
    }
  }, 1000);
}

// Check if the site's time limit has been reached
function checkSiteLimit(domain) {
  if (siteLimits[domain] && timerData[domain].timeSpent >= siteLimits[domain]) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.update(tabs[0].id, {
        url: "data:text/plain,You have reached your limit for " + domain,
      });
    });
  }
}

// Handle tab changes and updates
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      startTracking(tab.url);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    startTracking(tab.url);
  }
});

// Respond to messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTimerData") {
    sendResponse(timerData);
  } else if (request.action === "setSiteLimits") {
    siteLimits = request.data;
    chrome.storage.local.set({ siteLimits });
  }
});

// Load saved data from storage
chrome.storage.local.get(["timerData", "siteLimits"], (data) => {
  timerData = data.timerData || {};
  siteLimits = data.siteLimits || {};
});
