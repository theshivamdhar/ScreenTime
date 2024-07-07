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
        sendResponse({ success: true });
      }
    });
    return true; // Indicates that the response will be sent asynchronously
  }
});
