let timerData = {};
let siteLimits = {};

// Function to start the timer
function startTimer(url) {
  let domain = new URL(url).hostname;
  if (!timerData[domain]) {
    timerData[domain] = { timeSpent: 0, limit: siteLimits[domain] || 0 };
  }
  clearInterval(timerData.interval);
  timerData.interval = setInterval(() => {
    timerData[domain].timeSpent++;
    chrome.storage.local.set({ timerData });
    checkSiteLimit(domain);
  }, 1000);
}

// Function to check if the site limit is reached
function checkSiteLimit(domain) {
  if (siteLimits[domain] && timerData[domain].timeSpent >= siteLimits[domain]) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.update(tabs[0].id, {
        url: "data:text/plain,You have reached your limit for " + domain,
      });
    });
  }
}

// Listener for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      startTimer(tab.url);
    }
  });
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    startTimer(tab.url);
  }
});

// Listener for messages from the popup
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
