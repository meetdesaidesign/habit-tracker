// State management
let selectedColor = "#f9736f";
let selectedIconId = "book-open";

// Habit data structure
let habits = [];

// Icon definitions - file names from Assets/Dropdown Icons/heroicons-solid folder
const ICON_DEFINITIONS = [
  { file: "academic-cap.svg", id: "academic-cap" },
  { file: "archive-box.svg", id: "archive-box" },
  { file: "arrow-down-circle.svg", id: "arrow-down-circle" },
  { file: "arrow-left-circle.svg", id: "arrow-left-circle" },
  { file: "banknotes.svg", id: "banknotes" },
  { file: "book-open.svg", id: "book-open" },
  { file: "briefcase.svg", id: "briefcase" },
  { file: "building-office.svg", id: "building-office" },
  { file: "building-storefront.svg", id: "building-storefront" },
  { file: "chart-bar.svg", id: "chart-bar" },
  { file: "check-badge.svg", id: "check-badge" },
  { file: "code-bracket-square.svg", id: "code-bracket-square" },
  { file: "computer-desktop.svg", id: "computer-desktop" },
  { file: "credit-card.svg", id: "credit-card" },
  { file: "currency-dollar.svg", id: "currency-dollar" },
  { file: "device-phone-mobile.svg", id: "device-phone-mobile" },
  { file: "envelope.svg", id: "envelope" },
  { file: "face-smile.svg", id: "face-smile" },
  { file: "fire.svg", id: "fire" },
  { file: "folder.svg", id: "folder" },
  { file: "gift.svg", id: "gift" },
  { file: "globe-asia-australia.svg", id: "globe-asia-australia" },
  { file: "hand-thumb-up.svg", id: "hand-thumb-up" },
  { file: "rocket-launch.svg", id: "rocket-launch" },
  { file: "shield-check.svg", id: "shield-check" },
  { file: "shopping-bag.svg", id: "shopping-bag" },
  { file: "shopping-cart.svg", id: "shopping-cart" },
  { file: "square-2-stack.svg", id: "square-2-stack" },
  { file: "square-3-stack-3d.svg", id: "square-3-stack-3d" },
  { file: "swatch.svg", id: "swatch" },
  { file: "trophy.svg", id: "trophy" },
  { file: "user-group.svg", id: "user-group" },
  { file: "user.svg", id: "user" },
  { file: "video-camera.svg", id: "video-camera" },
  { file: "wallet.svg", id: "wallet" },
  { file: "wrench-screwdriver.svg", id: "wrench-screwdriver" }
];

// Icons loaded from files - will be populated by loadIcons()
let HABIT_ICONS = [];

// Load icons from Assets folder
async function loadIcons() {
  const iconPromises = ICON_DEFINITIONS.map(async (iconDef) => {
    try {
      const response = await fetch(`Assets/Dropdown Icons/heroicons-solid/${iconDef.file}`);
      if (!response.ok) {
        console.warn(`Failed to load icon: ${iconDef.file}`);
        return null;
      }
      const svgText = await response.text();
      // Replace fill="#0F172A" or any fill color with fill="currentColor" for CSS color control
      const processedSvg = svgText.replace(/fill="#[^"]*"/g, 'fill="currentColor"');
      
      return {
        id: iconDef.id,
        svg: processedSvg
      };
    } catch (error) {
      console.warn(`Error loading icon ${iconDef.file}:`, error);
      return null;
    }
  });
  
  const loadedIcons = await Promise.all(iconPromises);
  HABIT_ICONS = loadedIcons.filter(icon => icon !== null);
  return HABIT_ICONS;
}

// Show new habit form
function showNewHabitForm() {
  const emptyState = document.querySelector(".empty-state");
  const newHabitScreen = document.querySelector(".new-habit-screen");
  const habitStackScreen = document.querySelector(".habit-stack-screen");
  
  // Hide empty state and habit stack, show new habit form
  if (emptyState) emptyState.classList.add("hidden");
  if (habitStackScreen) habitStackScreen.classList.add("hidden");
  if (newHabitScreen) {
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
  const popover = document.getElementById("iconPickerPopover");
  const grid = document.getElementById("iconPickerGrid");
  
  if (popover && grid) {
    // Render all icons
    renderIconGrid(HABIT_ICONS, grid);
    
    // Show popover
    popover.classList.remove("hidden");
  }
}

// Close icon picker
function closeIconPicker() {
  const popover = document.getElementById("iconPickerPopover");
  
  if (popover) {
    popover.classList.add("hidden");
  }
}

// Render icon grid
function renderIconGrid(icons, container) {
  container.innerHTML = "";
  
  icons.forEach(icon => {
    const option = document.createElement("div");
    option.className = "icon-option";
    option.innerHTML = icon.svg.replace(/currentColor/g, "#555555");
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
  
  // Create new habit object
  const newHabit = {
    id: `habit-${Date.now()}`,
    title: habitName,
    description: habitDescription,
    color: selectedColor,
    iconId: selectedIconId,
    completions: {}
  };
  
  // Add to habits array (at the beginning so new habits appear first)
  habits.unshift(newHabit);
  
  // Clear form
  if (habitNameInput) habitNameInput.value = "";
  if (habitDescriptionInput) habitDescriptionInput.value = "";
  
  // Reset to defaults
  selectedColor = "#f9736f";
  selectedIconId = "book-open";
  updateHeroIcon(selectedIconId);
  setActiveColor(selectedColor);
  
  // Hide new habit form
  const newHabitScreen = document.querySelector(".new-habit-screen");
  if (newHabitScreen) {
    newHabitScreen.classList.add("hidden");
  }
  
  // Re-render app state to show habit stack with the new habit
  if (typeof renderAppState === 'function') {
    renderAppState();
  } else {
    // Fallback: if renderAppState doesn't exist, just show empty state for now
    showEmptyState();
  }
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Add habit button(s) - use event delegation or attach to all buttons
  // Use event delegation to handle buttons added dynamically
  document.addEventListener("click", function(e) {
    if (e.target.closest(".add-button")) {
      e.preventDefault();
      showNewHabitForm();
    }
  });
  
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
  
  // Close picker when clicking outside
  document.addEventListener("click", (e) => {
    const popover = document.getElementById("iconPickerPopover");
    const iconCircle = document.querySelector(".icon-circle");
    
    if (popover && !popover.classList.contains("hidden")) {
      // Check if click is outside popover and not on icon circle
      const isClickInsidePopover = popover.contains(e.target);
      const isClickOnIconCircle = iconCircle && iconCircle.contains(e.target);
      
      if (!isClickInsidePopover && !isClickOnIconCircle) {
        closeIconPicker();
      }
    }
  });
  
  // Load icons and initialize
  loadIcons().then(() => {
    updateHeroIcon(selectedIconId);
    
    // Setup drag and drop for habit cards (if container exists)
    setupDragAndDrop();
    
    // Render app state based on habits (after icons are loaded)
    renderAppState();
  });
});

// Render app state based on habits array
function renderAppState() {
  const emptyState = document.querySelector(".empty-state");
  const habitStackScreen = document.querySelector(".habit-stack-screen");
  
  if (habits.length === 0) {
    // Show empty state, hide habit stack
    if (emptyState) emptyState.classList.remove("hidden");
    if (habitStackScreen) habitStackScreen.classList.add("hidden");
  } else {
    // Hide empty state, show habit stack
    if (emptyState) emptyState.classList.add("hidden");
    if (habitStackScreen) habitStackScreen.classList.remove("hidden");
    // Render the habit cards
    renderHabitStack();
  }
}

// Render habit stack screen
function renderHabitStack() {
  const container = document.getElementById("habitCardsContainer");
  if (!container) return;
  
  container.innerHTML = "";
  habits.forEach(habit => {
    const card = renderHabitCard(habit);
    container.appendChild(card);
  });
  
  // Recalculate grid sizes after all cards are rendered (for window resize)
  setTimeout(() => {
    habits.forEach(habit => {
      const card = document.querySelector(`.habit-card[data-habit-id="${habit.id}"]`);
      const grid = card ? card.querySelector('.habit-year-grid') : null;
      if (card && grid) {
        calculateAndSetGridSize(card, grid, habit);
      }
    });
  }, 0);
}

// Helper: Get days in year (365 or 366 for leap years)
function getDaysInYear() {
  const year = new Date().getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  return isLeapYear ? 366 : 365;
}

// Helper: Get date string in YYYY-MM-DD format
function getDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Lighten color for card background
function lightenColorForCard(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Lighten by mixing with white (85% white, 15% original)
  const lightR = Math.round(r * 0.15 + 255 * 0.85);
  const lightG = Math.round(g * 0.15 + 255 * 0.85);
  const lightB = Math.round(b * 0.15 + 255 * 0.85);
  
  return `rgb(${lightR}, ${lightG}, ${lightB})`;
}

// Render yearly grid of squares
function renderYearGrid(habit) {
  const grid = document.createElement("div");
  grid.className = "habit-year-grid";
  
  const daysInYear = getDaysInYear();
  const lightColor = lightenColorForCard(habit.color);
  
  // Create all squares in date order (Jan 1 → Dec 31)
  for (let dayIndex = 0; dayIndex < daysInYear; dayIndex++) {
    const year = new Date().getFullYear();
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + dayIndex);
    const dateString = getDateString(date);
    
    const square = document.createElement("div");
    square.className = "year-grid-square";
    square.setAttribute("data-date", dateString);
    
    // Check if this date is completed
    if (habit.completions[dateString]) {
      square.classList.add("completed");
      square.style.backgroundColor = habit.color;
    } else {
      square.style.backgroundColor = lightColor;
    }
    
    grid.appendChild(square);
  }
  
  return grid;
}

// Calculate and set dynamic grid size based on available width
function calculateAndSetGridSize(card, grid, habit) {
  const daysInYear = getDaysInYear();
  const columns = Math.ceil(daysInYear / 7);
  const rows = 7;
  const gap = 4;
  
  const gridWidth = grid.clientWidth;
  const totalGaps = (columns - 1) * gap;
  const daySize = Math.floor((gridWidth - totalGaps) / columns);
  
  const minSize = 4;
  const finalSize = Math.max(daySize, minSize);
  
  grid.style.setProperty('--day-size', finalSize + 'px');
  grid.style.setProperty('--day-columns', columns);
  grid.style.gridTemplateColumns = `repeat(${columns}, ${finalSize}px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${finalSize}px)`;
}

// Mark habit as completed for today (toggle)
function markHabitCompletedToday(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  
  const today = getDateString();
  
  // Toggle completion
  if (habit.completions[today]) {
    delete habit.completions[today];
  } else {
    habit.completions[today] = true;
  }
  
  // Find the habit card first to scope all queries to this specific card
  const habitCard = document.querySelector(`.habit-card[data-habit-id="${habitId}"]`);
  if (!habitCard) return;
  
  // Update the check button state
  const checkButton = habitCard.querySelector(`.habit-check-button[data-habit-id="${habitId}"]`);
  if (checkButton) {
    const isCompletedToday = habit.completions[today] || false;
    
    if (isCompletedToday) {
      checkButton.style.backgroundColor = habit.color;
      checkButton.style.borderColor = habit.color;
      checkButton.classList.add("completed");
    } else {
      checkButton.style.backgroundColor = "#f4f4f4";
      checkButton.style.borderColor = "#bfbfbf";
      checkButton.classList.remove("completed");
    }
  }
  
  // Update the grid square for today
  const yearGrid = habitCard.querySelector('.habit-year-grid');
  if (yearGrid) {
    const todaySquare = yearGrid.querySelector(`.year-grid-square[data-date="${today}"]`);
    if (todaySquare) {
      const lightColor = lightenColorForCard(habit.color);
      if (habit.completions[today]) {
        todaySquare.classList.add("completed");
        todaySquare.style.backgroundColor = habit.color;
      } else {
        todaySquare.classList.remove("completed");
        todaySquare.style.backgroundColor = lightColor;
      }
    }
  }
}

// Render a single habit card
function renderHabitCard(habit) {
  const card = document.createElement("div");
  card.className = "habit-card";
  card.setAttribute("data-habit-id", habit.id);
  
  // Add hover actions
  const hoverActions = createHoverActions(habit.id);
  card.appendChild(hoverActions);
  
  // Card header
  const header = document.createElement("div");
  header.className = "habit-card-header";
  
  const info = document.createElement("div");
  info.className = "habit-card-info";
  
  // Icon container
  const iconContainer = document.createElement("div");
  iconContainer.className = "habit-icon-container";
  iconContainer.style.backgroundColor = habit.color;
  const icon = HABIT_ICONS.find(i => i.id === habit.iconId) || HABIT_ICONS[0];
  if (icon) {
    iconContainer.innerHTML = icon.svg.replace(/currentColor/g, "#ffffff");
  }
  info.appendChild(iconContainer);
  
  // Text info
  const textInfo = document.createElement("div");
  textInfo.className = "habit-text-info";
  
  const title = document.createElement("div");
  title.className = "habit-title";
  title.textContent = habit.title;
  textInfo.appendChild(title);
  
  const description = document.createElement("div");
  description.className = "habit-description";
  description.textContent = habit.description;
  textInfo.appendChild(description);
  
  info.appendChild(textInfo);
  header.appendChild(info);
  
  // Check button
  const checkButton = document.createElement("button");
  checkButton.className = "habit-check-button";
  checkButton.setAttribute("data-habit-id", habit.id);
  
  // Check if today is completed
  const today = getDateString();
  const isCompletedToday = habit.completions[today] || false;
  
  // Set button state based on completion
  if (isCompletedToday) {
    checkButton.style.backgroundColor = habit.color;
    checkButton.style.borderColor = habit.color;
    checkButton.classList.add("completed");
  } else {
    checkButton.style.backgroundColor = "#f4f4f4";
    checkButton.style.borderColor = "#bfbfbf";
  }
  
  const checkIcon = document.createElement("img");
  checkIcon.src = "Assets/check.svg";
  checkIcon.alt = "";
  checkIcon.className = "check-icon";
  checkButton.appendChild(checkIcon);
  
  checkButton.addEventListener("click", () => {
    markHabitCompletedToday(habit.id);
  });
  
  header.appendChild(checkButton);
  card.appendChild(header);
  
  // Year grid
  const yearGrid = renderYearGrid(habit);
  card.appendChild(yearGrid);
  
  // Calculate grid size after card is added to DOM
  setTimeout(() => {
    calculateAndSetGridSize(card, yearGrid, habit);
  }, 0);
  
  return card;
}

// Delete a habit (with undo functionality)
let pendingDeleteTimeout = null;
let pendingDeleteData = null;

function deleteHabit(habitId) {
  // Clear any existing pending delete
  if (pendingDeleteTimeout) {
    clearTimeout(pendingDeleteTimeout);
    pendingDeleteTimeout = null;
  }
  
  // If there's already a pending delete, complete it first
  if (pendingDeleteData) {
    permanentlyDeleteHabit(pendingDeleteData.habit.id);
  }
  
  // Find the habit
  const index = habits.findIndex(h => h.id === habitId);
  if (index === -1) return;
  
  const habit = habits[index];
  const card = document.querySelector(`.habit-card[data-habit-id="${habitId}"]`);
  
  if (!card) return;
  
  // Store delete data for undo
  pendingDeleteData = {
    habit: habit,
    index: index,
    card: card,
    habitId: habitId
  };
  
  // Hide the original card
  card.style.display = 'none';
  
  // Create undo card
  const undoCard = document.createElement("div");
  undoCard.className = "habit-card-undo";
  undoCard.setAttribute("data-habit-id", habitId);
  undoCard.innerHTML = `
    <div class="habit-card-undo-content">
      <div class="habit-card-undo-left">
        <div class="habit-card-undo-icon-container">
          <img src="Assets/check.svg" alt="Check" class="habit-card-undo-icon" />
        </div>
        <p class="habit-card-undo-text">Habit removed from your stack</p>
      </div>
      <button class="habit-card-undo-button">Undo</button>
    </div>
  `;
  
  // Insert undo card right after the hidden card
  card.parentNode.insertBefore(undoCard, card.nextSibling);
  
  // Handle undo button click
  const undoButton = undoCard.querySelector('.habit-card-undo-button');
  undoButton.addEventListener('click', () => {
    undoDeleteHabit(habitId);
  });
  
  // Set timeout to permanently delete after 5 seconds
  pendingDeleteTimeout = setTimeout(() => {
    permanentlyDeleteHabit(habitId);
  }, 5000);
}

// Undo delete - restore the habit
function undoDeleteHabit(habitId) {
  if (!pendingDeleteData || pendingDeleteData.habit.id !== habitId) return;
  
  // Clear timeout
  if (pendingDeleteTimeout) {
    clearTimeout(pendingDeleteTimeout);
    pendingDeleteTimeout = null;
  }
  
  // Remove undo card
  const undoCard = document.querySelector(`.habit-card-undo[data-habit-id="${habitId}"]`);
  if (undoCard) {
    undoCard.remove();
  }
  
  // Show the original card again
  if (pendingDeleteData.card) {
    pendingDeleteData.card.style.display = '';
  }
  
  // Clear pending delete data (habit is still in array, we just didn't remove it)
  pendingDeleteData = null;
}

// Permanently delete the habit (called after timeout)
function permanentlyDeleteHabit(habitId) {
  if (!pendingDeleteData || pendingDeleteData.habitId !== habitId) return;
  
  // Remove from habits array
  const index = habits.findIndex(h => h.id === habitId);
  if (index !== -1) {
    habits.splice(index, 1);
  }
  
  // Remove undo card
  const undoCard = document.querySelector(`.habit-card-undo[data-habit-id="${habitId}"]`);
  if (undoCard) {
    undoCard.remove();
  }
  
  // Remove original card
  if (pendingDeleteData.card) {
    pendingDeleteData.card.remove();
  }
  
  // Clear pending delete data
  pendingDeleteData = null;
  pendingDeleteTimeout = null;
  
  // Re-render app state (will show empty state if no habits left)
  renderAppState();
}

// Setup drag and drop for habit cards
// This should be called after habit cards are rendered
function setupDragAndDrop() {
  const container = document.getElementById("habitCardsContainer");
  if (!container) return;
  
  // Use event delegation since cards may be re-rendered
  container.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("habit-card-drag-handle") || 
        e.target.closest(".habit-card-drag-handle")) {
      const dragHandle = e.target.classList.contains("habit-card-drag-handle") 
        ? e.target 
        : e.target.closest(".habit-card-drag-handle");
      const card = dragHandle.closest(".habit-card");
      
      if (card) {
        card.style.opacity = "0.5";
        card.setAttribute("data-dragging", "true");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", card.outerHTML);
      }
    }
  });
  
  container.addEventListener("dragend", (e) => {
    const card = e.target.closest(".habit-card");
    if (card) {
      card.style.opacity = "1";
      card.removeAttribute("data-dragging");
    }
  });
  
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    const draggingCard = container.querySelector(".habit-card[data-dragging='true']");
    if (!draggingCard) return;
    
    const targetCard = e.target.closest(".habit-card");
    if (targetCard && targetCard !== draggingCard) {
      const rect = targetCard.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const mouseY = e.clientY;
      
      if (mouseY < midpoint) {
        container.insertBefore(draggingCard, targetCard);
      } else {
        container.insertBefore(draggingCard, targetCard.nextSibling);
      }
    }
  });
  
  container.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggingCard = container.querySelector(".habit-card[data-dragging='true']");
    if (draggingCard) {
      // Reorder habits array based on new DOM order
      const allCards = Array.from(container.querySelectorAll(".habit-card"));
      const oldIndex = parseInt(draggingCard.getAttribute("data-index") || "0");
      const newIndex = allCards.indexOf(draggingCard);
      
      if (newIndex !== -1 && newIndex !== oldIndex && typeof habits !== 'undefined' && habits) {
        const [movedHabit] = habits.splice(oldIndex, 1);
        habits.splice(newIndex, 0, movedHabit);
      }
    }
  });
}

// Create hover actions container for a habit card
// This should be called when rendering a habit card
function createHoverActions(habitId) {
  const hoverActions = document.createElement("div");
  hoverActions.className = "habit-card-hover-actions";
  
  // Drag handle button
  const dragHandle = document.createElement("button");
  dragHandle.className = "habit-card-drag-handle";
  dragHandle.setAttribute("data-habit-id", habitId);
  dragHandle.setAttribute("draggable", "true");
  const dragIcon = document.createElement("img");
  dragIcon.src = "Assets/drag-handle.svg";
  dragIcon.alt = "";
  dragIcon.style.width = "24px";
  dragIcon.style.height = "24px";
  dragHandle.appendChild(dragIcon);
  dragHandle.setAttribute("aria-label", "Drag to reorder");
  
  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "habit-card-delete";
  deleteButton.setAttribute("data-habit-id", habitId);
  const trashIcon = document.createElement("img");
  trashIcon.src = "Assets/trash.svg";
  trashIcon.alt = "";
  trashIcon.style.width = "24px";
  trashIcon.style.height = "24px";
  deleteButton.appendChild(trashIcon);
  deleteButton.setAttribute("aria-label", "Delete habit");
  
  // Attach delete handler
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteHabit(habitId);
  });
  
  hoverActions.appendChild(dragHandle);
  hoverActions.appendChild(deleteButton);
  
  return hoverActions;
}

