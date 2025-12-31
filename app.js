// State management
let selectedColor = "#f9736f";
let selectedIconId = "book-open";

// Heroicons outline icons for habit picker
const HABIT_ICONS = [
  {
    id: "book-open",
    label: "Reading",
    keywords: ["read", "book", "study", "learning"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>`
  },
  {
    id: "bolt",
    label: "Workout",
    keywords: ["exercise", "gym", "energy", "fitness", "sport"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5 10.5 6.75v4.5m0 0h4.5m-4.5 0L12 10.5m-8.25 3a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" /></svg>`
  },
  {
    id: "moon",
    label: "Sleep",
    keywords: ["sleep", "rest", "night", "bedtime"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>`
  },
  {
    id: "heart",
    label: "Health",
    keywords: ["health", "wellness", "care", "medical"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>`
  },
  {
    id: "beaker",
    label: "Experiment",
    keywords: ["experiment", "learn", "try", "test"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232 1.232 3.228 0 4.46s-3.228 1.232-4.46 0l-1.403-1.402m-4.24-4.24 1.403 1.403c1.232 1.232 3.228 1.232 4.46 0s1.232-3.228 0-4.46l-1.402-1.403" /></svg>`
  },
  {
    id: "pencil",
    label: "Write",
    keywords: ["write", "journal", "note", "writing"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>`
  },
  {
    id: "musical-note",
    label: "Music",
    keywords: ["music", "song", "audio", "listen"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" /></svg>`
  },
  {
    id: "sun",
    label: "Morning",
    keywords: ["morning", "sun", "wake", "day"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364 2.25L16.5 8.25m3 7.5H18m-9-9H5.25m9 9v9m-9-9 3-3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
  }
];

// Show new habit form
function showNewHabitForm() {
  const emptyState = document.querySelector(".empty-state");
  const newHabitScreen = document.querySelector(".new-habit-screen");
  
  if (emptyState && newHabitScreen) {
    // Trigger transition
    emptyState.classList.add("hidden");
    newHabitScreen.classList.remove("hidden");
    
    // Initialize colors when form is shown
    if (selectedColor) {
      setActiveColor(selectedColor);
    }
    
    // Initialize hero icon
    updateHeroIcon(selectedIconId);
    
    // Initialize textarea height
    const habitDescriptionInput = document.querySelector(".habit-description-input");
    if (habitDescriptionInput) {
      habitDescriptionInput.style.height = "auto";
      habitDescriptionInput.style.height = Math.min(habitDescriptionInput.scrollHeight, 200) + "px";
    }
    
    // Ensure save button is disabled when form is shown
    updateSaveButtonState();
    
    // Focus on the habit name input after transition starts
    const habitNameInput = document.querySelector(".habit-name-input");
    if (habitNameInput) {
      setTimeout(() => habitNameInput.focus(), 350);
    }
  }
}

// Show empty state
function showEmptyState() {
  const emptyState = document.querySelector(".empty-state");
  const newHabitScreen = document.querySelector(".new-habit-screen");
  
  if (emptyState && newHabitScreen) {
    // Trigger reverse transition
    newHabitScreen.classList.add("hidden");
    emptyState.classList.remove("hidden");
  }
}

// Convert hex to HSL and lighten it
function lightenColor(hex, lightness = 94) {
  // Remove # if present
  hex = hex.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  // Return HSL with increased lightness
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${lightness}%)`;
}

// Set active color and update UI
function setActiveColor(color) {
  const iconHeader = document.querySelector(".icon-header");
  const iconCircle = document.querySelector(".icon-circle");
  
  if (iconHeader && iconCircle) {
    // Set exact color on icon circle
    iconCircle.style.backgroundColor = color;
    
    // Set lighter version on header background
    const lightColor = lightenColor(color, 94);
    iconHeader.style.backgroundColor = lightColor;
    
    // Trigger subtle pop animation on icon circle
    iconCircle.classList.remove("pop");
    // Force reflow to restart animation
    void iconCircle.offsetWidth;
    iconCircle.classList.add("pop");
    
    // Remove animation class after animation completes
    setTimeout(() => {
      iconCircle.classList.remove("pop");
    }, 180);
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
  
  // Update UI colors
  setActiveColor(selectedColor);
}

// Update hero icon
function updateHeroIcon(iconId) {
  const iconInner = document.querySelector(".icon-inner");
  const icon = HABIT_ICONS.find(i => i.id === iconId);
  
  if (iconInner && icon) {
    iconInner.innerHTML = icon.svg;
    selectedIconId = iconId;
  }
}

// Open icon picker
function openIconPicker() {
  const modal = document.getElementById("iconPickerModal");
  const grid = document.getElementById("iconPickerGrid");
  const search = document.getElementById("iconPickerSearch");
  
  if (modal && grid) {
    // Render all icons
    renderIconGrid(HABIT_ICONS, grid);
    
    // Show modal
    modal.classList.remove("hidden");
    
    // Focus search
    if (search) {
      setTimeout(() => search.focus(), 100);
    }
  }
}

// Close icon picker
function closeIconPicker() {
  const modal = document.getElementById("iconPickerModal");
  const search = document.getElementById("iconPickerSearch");
  
  if (modal) {
    modal.classList.add("hidden");
    
    // Clear search
    if (search) {
      search.value = "";
    }
  }
}

// Render icon grid
function renderIconGrid(icons, container) {
  container.innerHTML = "";
  
  icons.forEach(icon => {
    const option = document.createElement("div");
    option.className = "icon-option";
    option.innerHTML = `
      ${icon.svg}
      <span class="icon-option-label">${icon.label}</span>
    `;
    option.addEventListener("click", () => {
      updateHeroIcon(icon.id);
      closeIconPicker();
    });
    container.appendChild(option);
  });
}

// Filter icons by search
function filterIcons(searchTerm) {
  const grid = document.getElementById("iconPickerGrid");
  if (!grid) return;
  
  const term = searchTerm.toLowerCase().trim();
  const filtered = HABIT_ICONS.filter(icon => {
    const labelMatch = icon.label.toLowerCase().includes(term);
    const keywordMatch = icon.keywords.some(kw => kw.toLowerCase().includes(term));
    return labelMatch || keywordMatch;
  });
  
  renderIconGrid(filtered, grid);
}

// Check if form is valid and enable/disable save button
function updateSaveButtonState() {
  const habitNameInput = document.querySelector(".habit-name-input");
  const habitDescriptionInput = document.querySelector(".habit-description-input");
  const saveButton = document.querySelector(".save-button");
  
  if (saveButton && habitNameInput && habitDescriptionInput) {
    const habitName = habitNameInput.value.trim();
    const habitDescription = habitDescriptionInput.value.trim();
    
    // Enable button only if both fields have text
    saveButton.disabled = !(habitName && habitDescription);
  }
}

// Handle save button
function saveHabit() {
  const habitNameInput = document.querySelector(".habit-name-input");
  const habitDescriptionInput = document.querySelector(".habit-description-input");
  
  const habitName = habitNameInput ? habitNameInput.value.trim() : "";
  const habitDescription = habitDescriptionInput ? habitDescriptionInput.value.trim() : "";
  
  if (!habitName || !habitDescription) {
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
      // Initialize colors on page load
      setActiveColor(selectedColor);
    }
  });
  
  // Save button
  const saveButton = document.querySelector(".save-button");
  if (saveButton) {
    saveButton.addEventListener("click", saveHabit);
  }
  
  // Auto-resize textarea
  const habitDescriptionInput = document.querySelector(".habit-description-input");
  if (habitDescriptionInput) {
    // Function to auto-resize textarea
    function autoResize(textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
    
    // Auto-resize on input
    habitDescriptionInput.addEventListener("input", function() {
      autoResize(this);
      updateSaveButtonState();
    });
    
    // Auto-resize on paste
    habitDescriptionInput.addEventListener("paste", function() {
      setTimeout(() => {
        autoResize(this);
        updateSaveButtonState();
      }, 0);
    });
    
    // Initial resize
    autoResize(habitDescriptionInput);
  }
  
  // Update save button state when habit name changes
  const habitNameInput = document.querySelector(".habit-name-input");
  if (habitNameInput) {
    habitNameInput.addEventListener("input", function() {
      updateSaveButtonState();
    });
    
    // Allow Enter key to move to description (when in habit name input)
    habitNameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (habitDescriptionInput) {
          habitDescriptionInput.focus();
        }
      }
    });
  }
  
  // Initial button state
  updateSaveButtonState();
  
  // Icon picker functionality
  const iconCircle = document.querySelector(".icon-circle");
  if (iconCircle) {
    iconCircle.addEventListener("click", openIconPicker);
  }
  
  const iconPickerSearch = document.getElementById("iconPickerSearch");
  if (iconPickerSearch) {
    iconPickerSearch.addEventListener("input", (e) => {
      filterIcons(e.target.value);
    });
  }
  
  // Close picker when clicking outside
  const iconPickerModal = document.getElementById("iconPickerModal");
  if (iconPickerModal) {
    iconPickerModal.addEventListener("click", (e) => {
      if (e.target === iconPickerModal) {
        closeIconPicker();
      }
    });
  }
  
  // Initialize default icon
  updateHeroIcon(selectedIconId);
});

