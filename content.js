(function () {
  // ... (existing code)

  // Make the container draggable
  let isDragging = false;
  let dragOffsetX, dragOffsetY;

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - container.offsetLeft;
    dragOffsetY = e.clientY - container.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      container.style.left = e.clientX - dragOffsetX + "px";
      container.style.top = e.clientY - dragOffsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Save time spent to storage
  function saveTimeSpent() {
    chrome.storage.local.get(["timeSpent"], (result) => {
      const timeSpent = result.timeSpent || {};
      const currentUrl = new URL(window.location.href).hostname;
      timeSpent[currentUrl] = (timeSpent[currentUrl] || 0) + 1;
      chrome.storage.local.set({ timeSpent });
    });
  }

  // Save time spent every second
  setInterval(saveTimeSpent, 1000);

  // ... (rest of the existing code)
})();
