chrome.runtime.onInstalled.addListener(() => {
  console.log("ScreenTime Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exitScreenTime") {
    chrome.storage.local.clear((error) => {
      if (chrome.runtime.lastError) {
        console.error("Error clearing storage:", chrome.runtime.lastError);
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
      } else {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (
              tab.url.startsWith("http://") ||
              tab.url.startsWith("https://")
            ) {
              chrome.tabs.sendMessage(tab.id, { action: "exitScreenTime" });
            }
          });
        });
        sendResponse({ success: true });
      }
    });
    return true; // Indicates that the response will be sent asynchronously
  } else if (request.action === "syncTime") {
    const { url, time } = request;
    const storageKey = `screenTime_${new URL(url).hostname}`;
    chrome.storage.local.set({ [storageKey]: time }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error syncing time:", chrome.runtime.lastError);
      }
    });
  }
});
