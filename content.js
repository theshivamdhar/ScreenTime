(function () {
  // Create and style the container for the information label and remove button
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.padding = "15px";
  container.style.backgroundColor = "#1e1e1e"; // Dark background
  container.style.color = "#e0e0e0"; // Light text color
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "18px";
  container.style.borderRadius = "10px";
  container.style.zIndex = "10000";
  container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  container.style.width = "auto";
  container.style.height = "auto";
  document.body.appendChild(container);

  // Create and style the information label
  const infoLabel = document.createElement("div");
  infoLabel.style.marginBottom = "10px";
  infoLabel.style.color = "#8a2be2"; // Purple shade
  container.appendChild(infoLabel);

  // Create and style the remove button
  const removeButton = document.createElement("button");
  removeButton.textContent = "Close Timer";
  removeButton.style.padding = "8px 15px";
  removeButton.style.backgroundColor = "#8a2be2"; // Purple background
  removeButton.style.color = "#ffffff"; // White text
  removeButton.style.border = "none";
  removeButton.style.borderRadius = "5px";
  removeButton.style.cursor = "pointer";
  container.appendChild(removeButton);

  // Initialize time spent variables
  let secondsSpent = 0;

  // Function to update the label with the time spent
  function updateLabel() {
    const hours = Math.floor(secondsSpent / 3600);
    const minutes = Math.floor((secondsSpent % 3600) / 60);
    const seconds = secondsSpent % 60;
    infoLabel.textContent = `Time spent on this site: ${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Increment the time spent every second
  const intervalId = setInterval(() => {
    secondsSpent++;
    updateLabel();
  }, 1000);

  // Add event listener to remove button to clear the interval and remove the container
  removeButton.addEventListener("click", () => {
    clearInterval(intervalId);
    // Ensure container is removed only if it exists
    if (document.body.contains(container)) {
      container.remove();
    }
  });

  // Initial label update
  updateLabel();
})();
