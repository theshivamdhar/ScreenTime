document.getElementById("set-limit").addEventListener("click", () => {
  let site = document.getElementById("site").value;
  let limit = parseInt(document.getElementById("limit").value) * 60; // Convert minutes to seconds
  if (site && limit) {
    chrome.runtime.sendMessage(
      { action: "setSiteLimits", data: { [site]: limit } },
      () => {
        alert("Limit set for " + site);
      }
    );
  }
});
