// State management
let selectedColor = "#f9736f";
let selectedIconId = "book-open";

// Habit data structure - will be loaded from localStorage in initApp()
let habits;

// LocalStorage helpers
function saveHabitsToStorage(habits) {
  try {
    localStorage.setItem("habits", JSON.stringify(habits));
  } catch (error) {
    console.error("Failed to save habits to localStorage:", error);
  }
}

function loadHabitsFromStorage() {
  try {
    const stored = localStorage.getItem("habits");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Migrate old format (completions object) to new format (completedDates array)
    return parsed.map(habit => {
      if (habit.completions && typeof habit.completions === 'object') {
        // Convert completions object to completedDates array
        habit.completedDates = Object.keys(habit.completions).filter(date => habit.completions[date]);
        delete habit.completions;
      }
      // Ensure completedDates exists
      if (!habit.completedDates) {
        habit.completedDates = [];
      }
      // Ensure createdAt exists
      if (!habit.createdAt) {
        habit.createdAt = new Date().toISOString();
      }
      return habit;
    });
  } catch (error) {
    console.error("Failed to load habits from localStorage:", error);
    return [];
  }
}

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
  
  const newHabitScreen = document.querySelector(".new-habit-screen");
  const editingHabitId = newHabitScreen ? newHabitScreen.getAttribute("data-editing-habit-id") : null;
  
  if (editingHabitId) {
    // Update existing habit
    const habitIndex = habits.findIndex(h => h.id === editingHabitId);
    if (habitIndex !== -1) {
      // Preserve the original completedDates and createdAt
      habits[habitIndex].title = habitName;
      habits[habitIndex].description = habitDescription;
      habits[habitIndex].color = selectedColor;
      habits[habitIndex].iconId = selectedIconId;
    }
    // Remove editing attribute
    if (newHabitScreen) {
      newHabitScreen.removeAttribute("data-editing-habit-id");
    }
  } else {
    // Create new habit object
    const newHabit = {
      id: `habit-${Date.now()}`,
      title: habitName,
      description: habitDescription,
      color: selectedColor,
      iconId: selectedIconId,
      createdAt: new Date().toISOString(),
      completedDates: []
    };
    
    // Add to habits array (at the beginning so new habits appear first)
    habits.unshift(newHabit);
  }
  
  // Save to localStorage after creating or updating
  saveHabitsToStorage(habits);
  
  // Clear form
  if (habitNameInput) habitNameInput.value = "";
  if (habitDescriptionInput) habitDescriptionInput.value = "";
  
  // Reset to defaults
  selectedColor = "#f9736f";
  selectedIconId = "book-open";
  updateHeroIcon(selectedIconId);
  setActiveColor(selectedColor);
  
  // Reset color swatches
  const colorSwatches = document.querySelectorAll(".color-swatch");
  colorSwatches.forEach((swatch, index) => {
    swatch.classList.remove("selected");
    if (index === 0) {
      swatch.classList.add("selected");
    }
  });
  
  // Hide new habit form
  if (newHabitScreen) {
    newHabitScreen.classList.add("hidden");
  }
  
  // Re-render app state to show habit stack with the updated habit
  if (typeof renderAppState === 'function') {
    renderAppState();
  } else {
    // Fallback: if renderAppState doesn't exist, just show empty state for now
    showEmptyState();
  }
}

// Initialize event listeners and app
document.addEventListener("DOMContentLoaded", async function () {
  // Initialize app first - loads habits from localStorage and icons, then renders
  // This ensures no empty state flash - habits and icons are loaded before first render
  await initApp();
  
  // Add habit button(s) - use event delegation or attach to all buttons
  // Use event delegation to handle buttons added dynamically
  document.addEventListener("click", function(e) {
    if (e.target.closest(".add-button")) {
      e.preventDefault();
      showNewHabitForm();
    }
  });
  
  // Back button - returns to previous view based on habits.length
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", function() {
      // Hide the new habit form
      const newHabitScreen = document.querySelector(".new-habit-screen");
      if (newHabitScreen) {
        newHabitScreen.classList.add("hidden");
      }
      
      // Reset form fields without affecting habits
      const habitNameInput = document.querySelector(".habit-name-input");
      const habitDescriptionInput = document.querySelector(".habit-description-input");
      if (habitNameInput) habitNameInput.value = "";
      if (habitDescriptionInput) {
        habitDescriptionInput.value = "";
        habitDescriptionInput.style.height = "auto";
      }
      
      // Clear editing state if present
      if (newHabitScreen) {
        newHabitScreen.removeAttribute("data-editing-habit-id");
      }
      
      // Reset form to defaults
      selectedColor = "#f9736f";
      selectedIconId = "book-open";
      updateHeroIcon(selectedIconId);
      setActiveColor(selectedColor);
      
      // Reset color swatches
      const colorSwatches = document.querySelectorAll(".color-swatch");
      colorSwatches.forEach((swatch, index) => {
        swatch.classList.remove("selected");
        if (index === 0) {
          swatch.classList.add("selected");
        }
      });
      
      // Render the correct view based on habits.length (single source of truth)
      renderAppState();
    });
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
  
  // Icons are already loaded in initApp(), so just update hero icon
  if (HABIT_ICONS.length > 0) {
    updateHeroIcon(selectedIconId);
  }
});

// Initialize app - loads habits from localStorage, then renders
// This ensures no empty state flash - habits are loaded before first render
async function initApp() {
  // Show loading skeleton while loading
  const loadingSkeleton = document.getElementById("loadingSkeletonScreen");
  if (loadingSkeleton) {
    loadingSkeleton.classList.remove("hidden");
  }
  
  // Hide empty state and habit stack initially
  const emptyState = document.querySelector(".empty-state");
  const habitStackScreen = document.querySelector(".habit-stack-screen");
  if (emptyState) emptyState.classList.add("hidden");
  if (habitStackScreen) habitStackScreen.classList.add("hidden");
  
  // Load habits from localStorage synchronously
  habits = loadHabitsFromStorage();
  
  // Load icons BEFORE rendering - ensures icons are available for habit cards
  await loadIcons();
  
  // Hide loading skeleton
  if (loadingSkeleton) {
    loadingSkeleton.classList.add("hidden");
  }
  
  // Render app state based on loaded habits
  // This is the ONLY initial render call - happens after habits and icons are loaded
  renderAppState();
}

// Render app state based on habits array (single source of truth)
function renderAppState() {
  const emptyState = document.querySelector(".empty-state");
  const habitStackScreen = document.querySelector(".habit-stack-screen");
  const newHabitScreen = document.querySelector(".new-habit-screen");
  
  // Ensure new habit screen is hidden when rendering app state
  if (newHabitScreen) {
    newHabitScreen.classList.add("hidden");
  }
  
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
  habits.forEach((habit, index) => {
    const card = renderHabitCard(habit);
    // Set data-index for drag-and-drop tracking
    card.setAttribute("data-index", index.toString());
    container.appendChild(card);
  });
  
  // Setup drag and drop after cards are rendered
  setupDragAndDrop();
  
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
    
    // Check if this date is in completedDates array
    const isCompleted = habit.completedDates && habit.completedDates.includes(dateString);
    if (isCompleted) {
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
  // Find habit by id (not index) - this ensures we update the correct habit
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  
  const today = getDateString();
  
  // Ensure completedDates array exists
  if (!habit.completedDates) {
    habit.completedDates = [];
  }
  
  // Toggle completion - add if not present, remove if present
  const dateIndex = habit.completedDates.indexOf(today);
  if (dateIndex > -1) {
    // Remove date if already completed
    habit.completedDates.splice(dateIndex, 1);
  } else {
    // Add date if not completed (only once per day)
    habit.completedDates.push(today);
  }
  
  // Save to localStorage after updating completion
  saveHabitsToStorage(habits);
  
  // Find the habit card first to scope all queries to this specific card
  const habitCard = document.querySelector(`.habit-card[data-habit-id="${habitId}"]`);
  if (!habitCard) return;
  
  // Update the check button state
  const checkButton = habitCard.querySelector(`.habit-check-button[data-habit-id="${habitId}"]`);
  if (checkButton) {
    const isCompletedToday = habit.completedDates.includes(today);
    
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
      const isCompletedToday = habit.completedDates.includes(today);
      if (isCompletedToday) {
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
  const isCompletedToday = habit.completedDates && habit.completedDates.includes(today);
  
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

// Edit a habit - opens the edit form with habit data pre-filled
function editHabit(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  
  // Set the form values to the habit's current data
  selectedColor = habit.color;
  selectedIconId = habit.iconId;
  
  // Update the form inputs
  const habitNameInput = document.querySelector(".habit-name-input");
  const habitDescriptionInput = document.querySelector(".habit-description-input");
  
  if (habitNameInput) {
    habitNameInput.value = habit.title;
  }
  if (habitDescriptionInput) {
    habitDescriptionInput.value = habit.description;
    // Auto-resize textarea
    habitDescriptionInput.style.height = "auto";
    habitDescriptionInput.style.height = Math.min(habitDescriptionInput.scrollHeight, 200) + "px";
  }
  
  // Update colors and icon
  setActiveColor(selectedColor);
  updateHeroIcon(selectedIconId);
  
  // Update color swatches
  const colorSwatches = document.querySelectorAll(".color-swatch");
  colorSwatches.forEach(swatch => {
    swatch.classList.remove("selected");
    if (swatch.getAttribute("data-color") === selectedColor) {
      swatch.classList.add("selected");
    }
  });
  
  // Store the habit ID being edited (we'll use this when saving)
  const newHabitScreen = document.querySelector(".new-habit-screen");
  if (newHabitScreen) {
    newHabitScreen.setAttribute("data-editing-habit-id", habitId);
  }
  
  // Show the new habit form (same form used for adding)
  showNewHabitForm();
  
  // Focus the habit name input and set cursor position after form transition completes
  setTimeout(() => {
    if (habitNameInput) {
      habitNameInput.focus();
      habitNameInput.setSelectionRange(habit.title.length, habit.title.length);
    }
  }, 350); // Wait for transition to complete
  
  updateSaveButtonState(); // Update button state based on pre-filled fields
}

// Create hover actions container for a habit card
// This should be called when rendering a habit card
function createHoverActions(habitId) {
  const hoverActions = document.createElement("div");
  hoverActions.className = "habit-card-hover-actions";
  
  // Edit button
  const editButton = document.createElement("button");
  editButton.className = "habit-card-edit";
  editButton.setAttribute("data-habit-id", habitId);
  editButton.setAttribute("type", "button");
  const editIcon = document.createElement("img");
  editIcon.src = "Assets/edit-2.svg";
  editIcon.alt = "";
  editIcon.style.width = "16px";
  editIcon.style.height = "16px";
  editIcon.style.pointerEvents = "none";
  editButton.appendChild(editIcon);
  editButton.setAttribute("aria-label", "Edit habit");
  
  // Attach edit handler
  editButton.addEventListener("click", (e) => {
    e.stopPropagation();
    editHabit(habitId);
  });
  
  // Delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "habit-card-delete";
  deleteButton.setAttribute("data-habit-id", habitId);
  const trashIcon = document.createElement("img");
  trashIcon.src = "Assets/trash.svg";
  trashIcon.alt = "";
  trashIcon.style.width = "24px";
  trashIcon.style.height = "24px";
  trashIcon.style.pointerEvents = "none";
  deleteButton.appendChild(trashIcon);
  deleteButton.setAttribute("aria-label", "Delete habit");
  
  // Attach delete handler
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteHabit(habitId);
  });
  
  hoverActions.appendChild(editButton);
  hoverActions.appendChild(deleteButton);
  
  return hoverActions;
}

// Drag and drop state (shared across all drag operations)
let dragState = {
  draggedCard: null,
  draggedIndex: null,
  placeholder: null,
  dragOffset: { x: 0, y: 0 },
  currentDragOver: null,
  isSetup: false
};

// Setup drag and drop for habit cards (only once using event delegation)
function setupDragAndDrop() {
  const container = document.getElementById("habitCardsContainer");
  if (!container) return;
  
  // Only set up listeners once (container persists, so this is safe)
  if (dragState.isSetup) return;
  dragState.isSetup = true;
  
  // Create placeholder element
  function createPlaceholder() {
    const placeholder = document.createElement("div");
    placeholder.className = "habit-card-placeholder";
    placeholder.style.height = "0";
    placeholder.style.marginBottom = "16px";
    placeholder.style.border = "2px dashed #ccc";
    placeholder.style.borderRadius = "8px";
    placeholder.style.transition = "height 200ms ease";
    return placeholder;
  }
  
  // Handle mouse move during drag
  function handleMouseMove(e) {
    if (!dragState.draggedCard) return;
    
    // Update dragged card position
    const newX = e.clientX - dragState.dragOffset.x;
    const newY = e.clientY - dragState.dragOffset.y;
    dragState.draggedCard.style.left = newX + "px";
    dragState.draggedCard.style.top = newY + "px";
    
    // Get dragged card bounds (using fixed position coordinates)
    const draggedCardRect = dragState.draggedCard.getBoundingClientRect();
    const draggedCardTop = draggedCardRect.top;
    const draggedCardBottom = draggedCardRect.bottom;
    const draggedCardCenterY = draggedCardTop + draggedCardRect.height / 2;
    
    // Find which card we're overlapping with (check for any overlap, not just mouse position)
    const cards = Array.from(container.children).filter(child => 
      child !== dragState.draggedCard && child !== dragState.placeholder && child.classList.contains("habit-card")
    );
    
    let dragOverCard = null;
    let minDistance = Infinity;
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();
      
      // Check if dragged card overlaps with this card (any vertical overlap)
      // Use a small threshold to trigger earlier
      const threshold = 20; // pixels
      const overlaps = !(draggedCardBottom + threshold < rect.top || draggedCardTop - threshold > rect.bottom);
      
      if (overlaps) {
        // Calculate distance from dragged card center to card center
        const cardCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(draggedCardCenterY - cardCenterY);
        
        if (distance < minDistance) {
          minDistance = distance;
          dragOverCard = card;
        }
      }
    }
    
    // Update drag over state
    if (dragState.currentDragOver && dragState.currentDragOver !== dragOverCard) {
      dragState.currentDragOver.classList.remove("is-drag-over");
    }
    
    // Always check if we need to move placeholder and animate, even if already over the same card
    if (dragOverCard) {
      dragOverCard.classList.add("is-drag-over");
      
      // Get all non-dragged cards for FLIP animation
      const allCards = Array.from(container.children).filter(child => 
        child !== dragState.draggedCard && child !== dragState.placeholder && child.classList.contains("habit-card")
      );
      
      // Determine where to place the placeholder based on dragged card center
      const cardRect = dragOverCard.getBoundingClientRect();
      const draggedCardCenterY = draggedCardRect.top + draggedCardRect.height / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      const insertBefore = draggedCardCenterY < cardCenterY;
      
      // Get current placeholder position
      const placeholderCurrentIndex = dragState.placeholder ? Array.from(container.children).indexOf(dragState.placeholder) : -1;
      const targetCardIndex = Array.from(container.children).indexOf(dragOverCard);
      const newPlaceholderIndex = insertBefore ? targetCardIndex : targetCardIndex + 1;
      
      // Only move placeholder if position actually changed
      if (placeholderCurrentIndex !== newPlaceholderIndex) {
        // FLIP Animation: First - record positions before DOM change
        const beforeRects = allCards.map(card => ({
          element: card,
          rect: card.getBoundingClientRect()
        }));
        
        // Move placeholder in DOM
        if (insertBefore) {
          container.insertBefore(dragState.placeholder, dragOverCard);
        } else {
          container.insertBefore(dragState.placeholder, dragOverCard.nextSibling);
        }
        
        // Update current drag over
        dragState.currentDragOver = dragOverCard;
        
        // FLIP Animation: Last - record positions after DOM change
        requestAnimationFrame(() => {
          const afterRects = allCards.map(card => ({
            element: card,
            rect: card.getBoundingClientRect()
          }));
          
          // Check if prefers-reduced-motion is enabled
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReducedMotion) return;
          
          // FLIP Animation: Invert - apply transform to move cards back to their old position
          beforeRects.forEach((before) => {
            const after = afterRects.find(a => a.element === before.element);
            if (after) {
              const deltaY = before.rect.top - after.rect.top;
              
              // Only animate if there's a meaningful change (> 1px)
              if (Math.abs(deltaY) > 1) {
                const card = before.element;
                
                // Invert: Move card back to its old position using transform
                card.style.transform = `translateY(${deltaY}px)`;
                card.style.transition = "none"; // No transition during invert
                
                // Force reflow to ensure transform is applied
                void card.offsetHeight;
                
                // FLIP Animation: Play - animate transform back to 0
                requestAnimationFrame(() => {
                  card.classList.add("is-reordering");
                  card.style.transform = "";
                  card.style.transition = "transform 200ms ease-in-out";
                  
                  // Remove reordering class after animation completes
                  setTimeout(() => {
                    card.classList.remove("is-reordering");
                    card.style.transition = "";
                  }, 200);
                });
              }
            }
          });
        });
      } else {
        // Update current drag over even if placeholder didn't move
        dragState.currentDragOver = dragOverCard;
      }
    } else if (!dragOverCard && dragState.placeholder && dragState.placeholder.parentNode && dragState.currentDragOver) {
      // If not over any card anymore, animate cards back
      dragState.currentDragOver.classList.remove("is-drag-over");
      dragState.currentDragOver = null;
      
      // Get all non-dragged cards for FLIP animation
      const allCards = Array.from(container.children).filter(child => 
        child !== dragState.draggedCard && child !== dragState.placeholder && child.classList.contains("habit-card")
      );
      
      // FLIP Animation: First - record positions before DOM change
      const beforeRects = allCards.map(card => ({
        element: card,
        rect: card.getBoundingClientRect()
      }));
      
      // Move placeholder to end
      container.appendChild(dragState.placeholder);
      
      // FLIP Animation: Last - record positions after DOM change
      requestAnimationFrame(() => {
        const afterRects = allCards.map(card => ({
          element: card,
          rect: card.getBoundingClientRect()
        }));
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        // FLIP Animation: Invert - apply transform to move cards back to their old position
        beforeRects.forEach((before) => {
          const after = afterRects.find(a => a.element === before.element);
          if (after) {
            const deltaY = before.rect.top - after.rect.top;
            
            // Only animate if there's a meaningful change (> 1px)
            if (Math.abs(deltaY) > 1) {
              const card = after.element;
              
              // Invert: Move card back to its old position using transform
              card.style.transform = `translateY(${deltaY}px)`;
              card.style.transition = "none"; // No transition during invert
              
              // Force reflow to ensure transform is applied
              void card.offsetHeight;
              
              // FLIP Animation: Play - animate transform back to 0
              requestAnimationFrame(() => {
                card.classList.add("is-reordering");
                card.style.transform = "";
                card.style.transition = "transform 200ms ease-in-out";
                
                // Remove reordering class after animation completes
                setTimeout(() => {
                  card.classList.remove("is-reordering");
                  card.style.transition = "";
                }, 200);
              });
            }
          }
        });
      });
    }
  }
  
  // Handle mouse up (end drag)
  function handleMouseUp(e) {
    if (!dragState.draggedCard) return;
    
    // Remove drag over state
    if (dragState.currentDragOver) {
      dragState.currentDragOver.classList.remove("is-drag-over");
      dragState.currentDragOver = null;
    }
    
    // Get placeholder position - this is where the card should snap to
    const placeholder = dragState.placeholder;
    const placeholderParent = placeholder ? placeholder.parentNode : null;
    
    if (placeholder && placeholderParent) {
      // Calculate offset from current card position to placeholder position
      const placeholderRect = placeholder.getBoundingClientRect();
      const cardRect = dragState.draggedCard.getBoundingClientRect();
      const offsetX = placeholderRect.left - cardRect.left;
      const offsetY = placeholderRect.top - cardRect.top;
      
      // Drop: Ease-out, no bounce - smoothly animate card to placeholder position
      dragState.draggedCard.classList.remove("is-following-cursor");
      dragState.draggedCard.style.transition = "transform 200ms ease-out, box-shadow 200ms ease-out";
      dragState.draggedCard.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1)`;
      dragState.draggedCard.style.boxShadow = "none";
      
      // Wait for transition, then replace placeholder with card (snap into list)
      setTimeout(() => {
        // Replace placeholder with the card in normal document flow
        placeholderParent.replaceChild(dragState.draggedCard, placeholder);
        
        // Remove ALL inline styles to restore normal flow positioning
        dragState.draggedCard.classList.remove("is-dragging");
        dragState.draggedCard.style.position = "";
        dragState.draggedCard.style.width = "";
        dragState.draggedCard.style.left = "";
        dragState.draggedCard.style.top = "";
        dragState.draggedCard.style.margin = "";
        dragState.draggedCard.style.transform = "";
        dragState.draggedCard.style.transition = "";
        dragState.draggedCard.style.boxShadow = "";
        dragState.draggedCard.style.pointerEvents = "";
        
        // Get final index in DOM after replacement
        const finalIndex = Array.from(container.children).indexOf(dragState.draggedCard);
        
        // Reorder habits array to match new DOM order
        if (finalIndex !== dragState.draggedIndex && finalIndex >= 0 && finalIndex < habits.length) {
          const [movedHabit] = habits.splice(dragState.draggedIndex, 1);
          habits.splice(finalIndex, 0, movedHabit);
        }
        
        // Save to localStorage (always save, even if order didn't change)
        saveHabitsToStorage(habits);
        
        // Clean up (don't re-render - card is already in correct position in DOM)
        dragState.draggedCard = null;
        dragState.draggedIndex = null;
        dragState.placeholder = null;
        dragState.dragOffset = { x: 0, y: 0 };
      }, 200);
    } else {
      // No placeholder found, reset card immediately
      dragState.draggedCard.classList.remove("is-dragging", "is-following-cursor");
      dragState.draggedCard.style.position = "";
      dragState.draggedCard.style.width = "";
      dragState.draggedCard.style.left = "";
      dragState.draggedCard.style.top = "";
      dragState.draggedCard.style.margin = "";
      dragState.draggedCard.style.transform = "";
      dragState.draggedCard.style.transition = "";
      dragState.draggedCard.style.boxShadow = "";
      dragState.draggedCard.style.pointerEvents = "";
      
      // Clean up
      dragState.draggedCard = null;
      dragState.draggedIndex = null;
      dragState.placeholder = null;
      dragState.dragOffset = { x: 0, y: 0 };
      
      // Save state
      saveHabitsToStorage(habits);
    }
    
    // Remove global listeners (cleanup happens in setTimeout above)
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }
  
  // Handle mouse down on card (using event delegation)
  container.addEventListener("mousedown", (e) => {
    const card = e.target.closest(".habit-card");
    if (!card) return;
    
    // Don't start drag if clicking on interactive elements
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea")) {
      return;
    }
    
    e.preventDefault();
    
    dragState.draggedCard = card;
    dragState.draggedIndex = Array.from(container.children).indexOf(card);
    const cardRect = card.getBoundingClientRect();
    
    dragState.dragOffset.x = e.clientX - cardRect.left;
    dragState.dragOffset.y = e.clientY - cardRect.top;
    
    // Lift: Scale 1.02 + soft shadow - apply lift animation
    card.classList.add("is-dragging");
    card.classList.add("is-following-cursor");
    
    // Create placeholder
    dragState.placeholder = createPlaceholder();
    dragState.placeholder.style.height = cardRect.height + "px";
    card.parentNode.insertBefore(dragState.placeholder, card);
    
    // Position dragged card - Drag: 1:1 follow, no easing (handled via inline styles)
    card.style.position = "fixed";
    card.style.width = cardRect.width + "px";
    card.style.left = cardRect.left + "px";
    card.style.top = cardRect.top + "px";
    card.style.margin = "0";
    card.style.pointerEvents = "none";
    card.style.transition = "none"; // No easing during drag movement
    
    // Add global mouse move and up listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });
}

