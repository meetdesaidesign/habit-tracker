// State management
let selectedColor = "#f9736f";

// Show new habit form
function showNewHabitForm() {
  const emptyState = document.querySelector(".empty-state");
  const newHabitScreen = document.querySelector(".new-habit-screen");
  
  if (emptyState && newHabitScreen) {
    emptyState.classList.add("hidden");
    newHabitScreen.classList.remove("hidden");
    // Focus on the habit name input
    const habitNameInput = document.querySelector(".habit-name-input");
    if (habitNameInput) {
      setTimeout(() => habitNameInput.focus(), 100);
    }
  }
}

// Show empty state
function showEmptyState() {
  const emptyState = document.querySelector(".empty-state");
  const newHabitScreen = document.querySelector(".new-habit-screen");
  
  if (emptyState && newHabitScreen) {
    emptyState.classList.remove("hidden");
    newHabitScreen.classList.add("hidden");
  }
}

// Handle color selection
function selectColor(colorElement) {
  // Remove selected class from all color swatches
  const allSwatches = document.querySelectorAll(".color-swatch");
  allSwatches.forEach((swatch) => {
    swatch.classList.remove("selected");
  });
  
  // Add selected class to clicked swatch
  colorElement.classList.add("selected");
  selectedColor = colorElement.getAttribute("data-color");
}

// Handle save button
function saveHabit() {
  const habitNameInput = document.querySelector(".habit-name-input");
  const habitDescriptionInput = document.querySelector(".habit-description-input");
  
  const habitName = habitNameInput ? habitNameInput.value.trim() : "";
  const habitDescription = habitDescriptionInput ? habitDescriptionInput.value.trim() : "";
  
  if (!habitName) {
    alert("Please enter a habit name");
    return;
  }
  
  // TODO: Save habit to storage/backend
  console.log("Saving habit:", {
    name: habitName,
    description: habitDescription,
    color: selectedColor,
  });
  
  // For now, just go back to empty state
  // In a real app, you'd save the habit and show the habit list
  showEmptyState();
  
  // Clear form
  if (habitNameInput) habitNameInput.value = "";
  if (habitDescriptionInput) habitDescriptionInput.value = "";
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Add habit button
  const addButton = document.querySelector(".add-button");
  if (addButton) {
    addButton.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("Add button clicked");
      showNewHabitForm();
    });
  } else {
    console.error("Add button not found!");
  }
  
  // Back button
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", showEmptyState);
  }
  
  // Color swatches - set up click handlers and ensure first is selected
  const colorSwatches = document.querySelectorAll(".color-swatch");
  colorSwatches.forEach((swatch, index) => {
    swatch.addEventListener("click", function () {
      selectColor(this);
    });
    
    // Ensure first swatch is selected by default
    if (index === 0) {
      swatch.classList.add("selected");
      selectedColor = swatch.getAttribute("data-color") || "#f9736f";
    }
  });
  
  // Save button
  const saveButton = document.querySelector(".save-button");
  if (saveButton) {
    saveButton.addEventListener("click", saveHabit);
  }
  
  // Allow Enter key to move to description (when in habit name input)
  const habitNameInput = document.querySelector(".habit-name-input");
  if (habitNameInput) {
    habitNameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const habitDescriptionInput = document.querySelector(".habit-description-input");
        if (habitDescriptionInput) {
          habitDescriptionInput.focus();
        }
      }
    });
  }
});

