chrome.runtime.onInstalled.addListener(() => {
  console.log("ScreenTime Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exitScreenTime") {
    chrome.storage.local.clear(() => {
      sendResponse({ success: true });
    });
    return true; // Indicates that the response will be sent asynchronously
  }
});
