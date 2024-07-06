let timerData = {};
let siteLimits = {};

// Start tracking time for a given domain
function startTracking(domain) {
  if (!timerData[domain]) {
    timerData[domain] = { timeSpent: 0 };
  }
}

// Check if the site's time limit has been reached
function checkSiteLimit(domain) {
  if (siteLimits[domain] && timerData[domain].timeSpent >= siteLimits[domain]) {
    chrome.storage.local.get(["siteLimits"], (data) => {
      siteLimits = data.siteLimits || {};
      chrome.tabs.query({ url: "*://*/*" }, (tabs) => {
        tabs.forEach((tab) => {
          if (new URL(tab.url).hostname === domain) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                alert("You have reached your time limit for this site.");
              },
            });
          }
        });
      });
    });
  }
}

// Handle tab activation and updates
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      let domain = new URL(tab.url).hostname;
      startTracking(domain);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    let domain = new URL(tab.url).hostname;
    startTracking(domain);
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

// Update time data every second
setInterval(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      let domain = new URL(tab.url).hostname;
      if (timerData[domain]) {
        timerData[domain].timeSpent++;
        chrome.storage.local.set({ timerData });
        checkSiteLimit(domain);
      }
    });
  });
}, 1000);
