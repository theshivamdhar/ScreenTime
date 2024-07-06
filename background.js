let isScreenTimeActive = true;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openDashboard") {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 400,
      height: 600,
    });
  } else if (request.action === "exitScreenTime") {
    isScreenTimeActive = false;
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "exitScreenTime" });
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isScreenTimeActive) {
    chrome.tabs.sendMessage(tabId, { action: "resetTimer" });
  }
});
