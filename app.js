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

// Expose to window for habitsSave.js
window.saveHabitsToStorage = saveHabitsToStorage;

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
  // If icons are already loaded, return early
  if (HABIT_ICONS.length > 0) {
    return;
  }
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
  const logoutButton = document.getElementById("btnLogout") || document.querySelector(".logout-button");
  
  // Hide empty state and habit stack, show new habit form
  if (emptyState) emptyState.classList.add("hidden");
  if (habitStackScreen) habitStackScreen.classList.add("hidden");
  if (logoutButton) {
    logoutButton.classList.add("hidden");
    logoutButton.style.display = "none";
  }
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

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
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
    
    // Set shadow color based on selected color (50% opacity)
    const rgb = hexToRgb(color);
    if (rgb) {
      iconCircle.style.setProperty('--icon-circle-shadow-color', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.50)`);
    }
    
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
  const iconHeader = document.querySelector(".icon-header");
  
  if (popover && grid) {
    // Render all icons
    renderIconGrid(HABIT_ICONS, grid);
    
    // Show popover
    popover.classList.remove("hidden");
    
    // Add active class to icon header for styling
    if (iconHeader) {
      iconHeader.classList.add("picker-open");
    }
  }
}

// Close icon picker
function closeIconPicker() {
  const popover = document.getElementById("iconPickerPopover");
  const iconHeader = document.querySelector(".icon-header");
  
  if (popover) {
    popover.classList.add("hidden");
  }
  
  // Remove active class from icon header
  if (iconHeader) {
    iconHeader.classList.remove("picker-open");
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
async function saveHabit() {
  console.log("🔵 saveHabit() called");
  
  const habitNameInput = document.querySelector(".habit-name-input");
  const habitDescriptionInput = document.querySelector(".habit-description-input");
  
  const habitName = habitNameInput ? habitNameInput.value.trim() : "";
  const habitDescription = habitDescriptionInput ? habitDescriptionInput.value.trim() : "";
  
  if (!habitName || !habitDescription) {
    console.log("❌ saveHabit: form validation failed");
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
  
  // Save to Supabase
  await window.saveHabitsSmart(habits);
  
  // Hide the new habit form FIRST - EXACTLY like back button does
  const logoutButton = document.getElementById("btnLogout") || document.querySelector(".logout-button");
  if (newHabitScreen) {
    newHabitScreen.classList.add("hidden");
  }
  if (logoutButton) {
    logoutButton.classList.remove("hidden");
    logoutButton.style.display = "";
  }
  
  // Reset form fields without affecting habits
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
      const logoutButton = document.getElementById("btnLogout") || document.querySelector(".logout-button");
      if (newHabitScreen) {
        newHabitScreen.classList.add("hidden");
      }
      if (logoutButton) {
        logoutButton.classList.remove("hidden");
        logoutButton.style.display = "";
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
    saveButton.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      saveHabit();
    });
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
  
  // Calendar modal close handlers
  const closeButton = document.getElementById("closeCalendarModal");
  const modal = document.getElementById("habitCalendarModal");
  const backdrop = modal ? modal.querySelector(".habit-calendar-backdrop") : null;
  
  if (closeButton) {
    closeButton.addEventListener("click", closeCalendarModal);
  }
  
  if (backdrop) {
    backdrop.addEventListener("click", closeCalendarModal);
  }
  
  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) {
      closeCalendarModal();
    }
  });

  // Share button handler
  const shareButton = document.getElementById("shareHabitButton");
  if (shareButton) {
    shareButton.addEventListener("click", () => {
      const modal = document.getElementById("habitCalendarModal");
      if (modal && modal.classList.contains("is-open")) {
        // Get the current habit from the modal
        const habitId = modal.getAttribute("data-current-habit-id");
        if (habitId) {
          const habit = habits.find(h => h.id === habitId);
          if (habit) {
            openShareMenu(habit);
          }
        }
      }
    });
  }

  // Close share menu handler
  const closeShareMenuBtn = document.getElementById("closeShareMenu");
  const shareMenu = document.getElementById("shareMenu");
  if (closeShareMenuBtn) {
    closeShareMenuBtn.addEventListener("click", closeShareMenu);
  }
  if (shareMenu) {
    const backdrop = shareMenu.querySelector(".share-menu-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closeShareMenu);
    }
  }

  // Share option handlers
  const shareOptions = document.querySelectorAll(".share-option");
  shareOptions.forEach(option => {
    option.addEventListener("click", () => {
      const platform = option.getAttribute("data-platform");
      const modal = document.getElementById("habitCalendarModal");
      if (modal && modal.classList.contains("is-open")) {
        const habitId = modal.getAttribute("data-current-habit-id");
        if (habitId) {
          const habit = habits.find(h => h.id === habitId);
          if (habit) {
            shareHabit(habit, platform);
          }
        }
      }
    });
  });
});

// Initialize app - loads habits from localStorage, then renders
// This ensures no empty state flash - habits are loaded before first render
// Ensure icons are loaded (can be called multiple times safely)
window.ensureIconsLoaded = loadIcons;

async function initApp() {
  // Load icons - always needed for rendering habit cards
  await loadIcons();
  
  // Check if we're in guest mode or if Supabase is not available
  const guestMode = window.isGuestMode && window.isGuestMode();
  const hasSupabase = window.supabaseClient;
  
  // If Supabase is available and we're not in guest mode, don't load from localStorage
  // Authentication will handle loading habits from Supabase
  if (hasSupabase && !guestMode) {
    // Check if there's an active session
    try {
      const { data } = await window.supabaseClient.auth.getSession();
      if (data && data.session) {
        // Just initialize habits as empty array, Supabase will load them
        habits = [];
        return;
      }
    } catch (error) {
      console.log("Error checking session:", error);
      // Fall through to localStorage loading
    }
  }
  
  // Load from localStorage (guest mode or no Supabase or no session)
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
  const logoutButton = document.querySelector(".logout-button");
  
  // Ensure new habit screen is hidden when rendering app state
  if (newHabitScreen) {
    newHabitScreen.classList.add("hidden");
  }
  // Show logout button when form is hidden
  if (logoutButton) {
    logoutButton.classList.remove("hidden");
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

// Make renderAppState accessible globally
window.renderAppState = renderAppState;

// Function to set habits from Supabase (called by setHabitsFromCloud)
window.setHabits = function(newHabits) {
  habits = newHabits || [];
};

// Render habit stack screen
function renderHabitStack() {
  const container = document.getElementById("habitCardsContainer");
  if (!container) return;
  
  container.innerHTML = "";
  habits.forEach((habit, index) => {
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
    // Trigger bouncy animation
    checkButton.classList.remove("animate-bounce");
    // Force reflow to restart animation
    void checkButton.offsetWidth;
    checkButton.classList.add("animate-bounce");
    
    // Remove animation class after animation completes
    setTimeout(() => {
      checkButton.classList.remove("animate-bounce");
    }, 500);
    
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
  
  // Add click handler to open calendar modal (but not on interactive elements)
  card.addEventListener("click", (e) => {
    // Don't open modal if clicking on interactive elements
    if (e.target.closest("button") || 
        e.target.closest(".habit-card-hover-actions") ||
        e.target.closest(".habit-year-grid")) {
      return;
    }
    
    openCalendarModal(habit);
  });
  
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

// Calendar Modal Functions
let currentHabitForSharing = null;

function openCalendarModal(habit) {
  const modal = document.getElementById("habitCalendarModal");
  if (!modal) return;
  
  // Store current habit for sharing
  currentHabitForSharing = habit;
  modal.setAttribute("data-current-habit-id", habit.id);
  
  // Set habit info in modal
  const iconContainer = document.getElementById("modalHabitIcon");
  const titleEl = document.getElementById("modalHabitTitle");
  const descriptionEl = document.getElementById("modalHabitDescription");
  
  if (iconContainer) {
    iconContainer.style.backgroundColor = habit.color;
    const icon = HABIT_ICONS.find(i => i.id === habit.iconId) || HABIT_ICONS[0];
    if (icon) {
      iconContainer.innerHTML = icon.svg.replace(/currentColor/g, "#ffffff");
    }
  }
  
  if (titleEl) titleEl.textContent = habit.title;
  if (descriptionEl) descriptionEl.textContent = habit.description;
  
  // Render calendar
  renderCalendar(habit);
  
  // Open modal with smooth transition
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function closeCalendarModal() {
  const modal = document.getElementById("habitCalendarModal");
  if (!modal) return;
  
  modal.classList.remove("is-open");
  document.body.style.overflow = ""; // Restore scrolling
}

function renderCalendar(habit) {
  const grid = document.getElementById("habitCalendarGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  const year = new Date().getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Add weekday labels
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach(day => {
    const label = document.createElement("div");
    label.className = "habit-calendar-weekday-label";
    label.textContent = day;
    grid.appendChild(label);
  });
  
  // Generate all dates for the year, organized by month
  let currentDate = new Date(startDate);
  let currentMonth = -1;
  
  while (currentDate <= endDate) {
    const date = new Date(currentDate);
    const month = date.getMonth();
    
    // Add month label when month changes
    if (month !== currentMonth) {
      // If not the first month, add empty cells to complete the previous month's week
      if (currentMonth !== -1) {
        const lastDayOfPrevMonth = new Date(year, month, 0);
        const lastDayOfWeek = lastDayOfPrevMonth.getDay();
        const remainingDays = 6 - lastDayOfWeek;
        for (let i = 0; i < remainingDays; i++) {
          const empty = document.createElement("div");
          grid.appendChild(empty);
        }
      }
      
      const monthLabel = document.createElement("div");
      monthLabel.className = "habit-calendar-month-label";
      monthLabel.textContent = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      grid.appendChild(monthLabel);
      
      // Add empty cells for the first week of the month
      const firstDayOfMonthDay = date.getDay();
      for (let i = 0; i < firstDayOfMonthDay; i++) {
        const empty = document.createElement("div");
        grid.appendChild(empty);
      }
      
      currentMonth = month;
    }
    
    const dateString = getDateString(date);
    const isCompleted = habit.completedDates && habit.completedDates.includes(dateString);
    const isFuture = date > today;
    const isToday = dateString === getDateString(today);
    
    const dateEl = document.createElement("div");
    dateEl.className = "habit-calendar-date";
    dateEl.setAttribute("data-date", dateString);
    
    if (isFuture) {
      dateEl.classList.add("is-future");
    }
    if (isCompleted) {
      dateEl.classList.add("is-completed");
    }
    if (isToday) {
      dateEl.classList.add("is-today");
    }
    
    // Date label
    const label = document.createElement("div");
    label.className = "habit-calendar-date-label";
    label.textContent = date.getDate();
    dateEl.appendChild(label);
    
    // Dot indicator
    const dot = document.createElement("div");
    dot.className = "habit-calendar-date-dot";
    if (isCompleted) {
      dot.style.backgroundColor = habit.color;
      dot.style.color = habit.color;
    }
    dateEl.appendChild(dot);
    
    // Add click handler for past dates
    if (!isFuture) {
      dateEl.addEventListener("click", () => {
        toggleDateCompletion(habit.id, dateString, dateEl, dot, habit.color);
      });
    }
    
    grid.appendChild(dateEl);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Fill remaining cells of the last month's week
  const lastDate = new Date(endDate);
  const lastDayOfWeek = lastDate.getDay();
  const remainingDays = 6 - lastDayOfWeek;
  for (let i = 0; i < remainingDays; i++) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }
}

function toggleDateCompletion(habitId, dateString, dateEl, dotEl, habitColor) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  
  // Ensure completedDates array exists
  if (!habit.completedDates) {
    habit.completedDates = [];
  }
  
  // Toggle completion
  const dateIndex = habit.completedDates.indexOf(dateString);
  const isCompleted = dateIndex > -1;
  
  if (isCompleted) {
    // Remove date
    habit.completedDates.splice(dateIndex, 1);
    dateEl.classList.remove("is-completed");
    dotEl.style.transform = "scale(0)";
    dotEl.style.opacity = "0";
  } else {
    // Add date
    habit.completedDates.push(dateString);
    dateEl.classList.add("is-completed");
    dotEl.style.backgroundColor = habitColor;
    dotEl.style.color = habitColor;
    dotEl.style.transform = "scale(1)";
    dotEl.style.opacity = "1";
  }
  
  // Save to storage
  saveHabitsToStorage(habits);
  
  // Save to Supabase if available
  if (typeof window.saveHabitsSmart === "function") {
    window.saveHabitsSmart(habits);
  }
  
  // Update the main card's grid if it exists
  const habitCard = document.querySelector(`.habit-card[data-habit-id="${habitId}"]`);
  if (habitCard) {
    const yearGrid = habitCard.querySelector('.habit-year-grid');
    if (yearGrid) {
      const square = yearGrid.querySelector(`.year-grid-square[data-date="${dateString}"]`);
      if (square) {
        const lightColor = lightenColorForCard(habitColor);
        if (isCompleted) {
          square.classList.remove("completed");
          square.style.backgroundColor = lightColor;
        } else {
          square.classList.add("completed");
          square.style.backgroundColor = habitColor;
        }
      }
    }
  }
}

// Share Menu Functions
async function openShareMenu(habit) {
  const shareMenu = document.getElementById("shareMenu");
  if (shareMenu) {
    // Generate preview image in 16:9 ratio (X platform format)
    const previewImage = document.getElementById("shareMenuPreview");
    if (previewImage) {
      try {
        const previewDataUrl = await generateShareImage(habit, "x");
        previewImage.src = previewDataUrl;
        previewImage.style.display = "block";
      } catch (error) {
        console.error("Error generating preview:", error);
        if (previewImage) {
          previewImage.style.display = "none";
        }
      }
    }
    
    shareMenu.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function closeShareMenu() {
  const shareMenu = document.getElementById("shareMenu");
  if (shareMenu) {
    shareMenu.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

// Calculate habit progress
function calculateHabitProgress(habit) {
  const daysInYear = getDaysInYear();
  const completedCount = habit.completedDates ? habit.completedDates.length : 0;
  return {
    completed: completedCount,
    total: daysInYear,
    percentage: Math.round((completedCount / daysInYear) * 100)
  };
}

// Generate shareable image
async function generateShareImage(habit, platform) {
  // Platform-specific dimensions
  const dimensions = {
    x: { width: 1200, height: 675 }, // 16:9 aspect ratio
    instagram: { width: 1080, height: 1920 }, // 9:16 story format
    whatsapp: { width: 1080, height: 1920 } // 9:16 story format
  };

  const { width, height } = dimensions[platform] || dimensions.x;
  const progress = calculateHabitProgress(habit);

  // Create a canvas for the shareable image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Background gradient based on habit color
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const rgb = hexToRgb(habit.color);
  if (rgb) {
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add white background for content area
  const padding = platform === 'x' ? 80 : 60;
  const contentWidth = width - (padding * 2);
  const contentHeight = height - (padding * 2);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(padding, padding, contentWidth, contentHeight);

  // Add habit icon
  const iconSize = platform === 'x' ? 120 : 100;
  const iconX = width / 2;
  const iconY = padding + 80;
  
  ctx.fillStyle = habit.color;
  ctx.beginPath();
  ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Add habit title
  ctx.fillStyle = "#2b2b2b";
  ctx.font = `bold ${platform === 'x' ? '48' : '40'}px "Google Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const titleY = iconY + iconSize / 2 + 40;
  ctx.fillText(habit.title, iconX, titleY);

  // Add progress text
  ctx.fillStyle = "#555555";
  ctx.font = `${platform === 'x' ? '32' : '28'}px "Google Sans", sans-serif`;
  const progressText = `My ${habit.title} progress: ${progress.completed}/${progress.total} completed`;
  const progressY = titleY + (platform === 'x' ? 60 : 50);
  ctx.fillText(progressText, iconX, progressY);

  // Add percentage
  ctx.fillStyle = habit.color;
  ctx.font = `bold ${platform === 'x' ? '72' : '64'}px "Google Sans", sans-serif`;
  const percentageY = progressY + (platform === 'x' ? 80 : 70);
  ctx.fillText(`${progress.percentage}%`, iconX, percentageY);

  // Add calendar grid visualization - matching the card's dots chart
  const daysInYear = getDaysInYear();
  const gridCols = Math.ceil(daysInYear / 7); // Same calculation as the card
  const gridRows = 7;
  const gap = 4; // Same gap as the card
  
  // Calculate grid size to fit nicely in the available space
  const gridPadding = platform === 'x' ? 60 : 40;
  const availableWidth = contentWidth - (gridPadding * 2);
  const maxSquareSize = platform === 'x' ? 12 : 10;
  const squareSize = Math.min((availableWidth - (gridCols - 1) * gap) / gridCols, maxSquareSize);
  const gridWidth = (squareSize * gridCols) + ((gridCols - 1) * gap);
  const gridHeight = (squareSize * gridRows) + ((gridRows - 1) * gap);
  const gridX = (width - gridWidth) / 2;
  const gridStartY = percentageY + (platform === 'x' ? 100 : 80);

  const lightColor = lightenColorForCard(habit.color);

  // Draw grid squares - show actual completion pattern (matching card layout)
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  
  // Draw all days of the year in the same order as the card (Jan 1 → Dec 31)
  for (let dayIndex = 0; dayIndex < daysInYear; dayIndex++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIndex);
    const dateString = getDateString(date);
    const isCompleted = habit.completedDates && habit.completedDates.includes(dateString);
    
    // Calculate position: column by day index, row by week
    const col = Math.floor(dayIndex / gridRows); // Column (week)
    const row = dayIndex % gridRows; // Row (day of week)
    const x = gridX + col * (squareSize + gap);
    const y = gridStartY + row * (squareSize + gap);
    
    // Set color based on completion status
    if (isCompleted) {
      ctx.fillStyle = habit.color;
    } else {
      ctx.fillStyle = lightColor;
    }
    
    // Draw rounded square (matching card style with border-radius: 4px)
    const radius = 4;
    if (ctx.roundRect) {
      // Use modern roundRect if available
      ctx.beginPath();
      ctx.roundRect(x, y, squareSize, squareSize, radius);
      ctx.fill();
    } else {
      // Fallback: draw rounded rectangle manually
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + squareSize - radius, y);
      ctx.quadraticCurveTo(x + squareSize, y, x + squareSize, y + radius);
      ctx.lineTo(x + squareSize, y + squareSize - radius);
      ctx.quadraticCurveTo(x + squareSize, y + squareSize, x + squareSize - radius, y + squareSize);
      ctx.lineTo(x + radius, y + squareSize);
      ctx.quadraticCurveTo(x, y + squareSize, x, y + squareSize - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Add description at bottom (only for X)
  if (habit.description && platform === 'x') {
    ctx.fillStyle = "#999999";
    ctx.font = "24px 'Google Sans', sans-serif";
    ctx.textAlign = "center";
    const descY = gridStartY + gridHeight + 60;
    const maxWidth = contentWidth - 40;
    const words = habit.description.split(' ');
    let line = '';
    let lineY = descY;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, iconX, lineY);
        line = words[i] + ' ';
        lineY += 32;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, iconX, lineY);
  }

  return canvas.toDataURL("image/png");
}

// Upload image to imgur (for X/Twitter sharing fallback)
async function uploadImageToImgur(imageDataUrl) {
  try {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', blob);
    
    // Upload to Imgur (anonymous upload, no auth required)
    // Using a public client ID that works for anonymous uploads
    const uploadResponse = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7' // Public anonymous client ID for basic uploads
      },
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.data?.error || 'Imgur upload failed');
    }
    
    const data = await uploadResponse.json();
    if (data.success && data.data && data.data.link) {
      return data.data.link; // Returns the image URL
    } else {
      throw new Error('Invalid response from Imgur');
    }
  } catch (error) {
    console.error('Error uploading to Imgur:', error);
    throw error;
  }
}

// Share habit to platform
async function shareHabit(habit, platform) {
  try {
    // Close share menu
    closeShareMenu();

    // Generate image
    const imageDataUrl = await generateShareImage(habit, platform);
    const progress = calculateHabitProgress(habit);
    const caption = `My ${habit.title} progress: ${progress.completed}/${progress.total} completed`;

    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `habit-${habit.title}-${Date.now()}.png`, { type: "image/png" });

    // Share based on platform
    if (platform === "x") {
      // X/Twitter: Try Web Share API first, then upload to Imgur and open Twitter
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: caption,
            text: caption,
            files: [file]
          });
          return;
        } catch (err) {
          console.log("Web Share API failed for X, trying Imgur upload");
        }
      }
      
      // Fallback: Upload to Imgur and open Twitter with image link
      try {
        const imageUrl = await uploadImageToImgur(imageDataUrl);
        const tweetText = `${caption}\n\n${imageUrl}`;
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(xUrl, "_blank");
      } catch (err) {
        // If Imgur fails, download and open Twitter with text only
        downloadImage(imageDataUrl, `habit-${habit.title}.png`);
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
        window.open(xUrl, "_blank");
        alert("Image downloaded! You can attach it manually to your tweet.");
      }
      
    } else if (platform === "instagram") {
      // Instagram: Use Web Share API if available, otherwise download
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: caption,
            text: caption,
            files: [file]
          });
          return;
        } catch (err) {
          console.log("Web Share API failed for Instagram");
        }
      }
      
      // Fallback: Download image
      downloadImage(imageDataUrl, `habit-${habit.title}-instagram-story.png`);
      // Try to open Instagram (works on mobile)
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = `instagram://camera`;
      } else {
        alert("Image downloaded! Open Instagram and share it as a story.");
      }
      
    } else if (platform === "whatsapp") {
      // WhatsApp: Use Web Share API if available (best option - works on mobile and some desktop)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: caption,
            text: caption,
            files: [file]
          });
          return;
        } catch (err) {
          // User cancelled or error - continue to fallback
          console.log("Web Share API cancelled or failed for WhatsApp");
        }
      }
      
      // Fallback: Open WhatsApp with text (image will need to be attached manually)
      const whatsappText = `${caption}`;
      
      // For mobile, use WhatsApp app URL
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = `whatsapp://send?text=${encodeURIComponent(whatsappText)}`;
        // Download image so user can attach it
        setTimeout(() => {
          downloadImage(imageDataUrl, `habit-${habit.title}-whatsapp.png`);
        }, 500);
      } else {
        // Desktop: Open WhatsApp Web
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`, "_blank");
        // Download image so user can attach it
        setTimeout(() => {
          downloadImage(imageDataUrl, `habit-${habit.title}-whatsapp.png`);
        }, 500);
      }
    }
    
  } catch (error) {
    console.error("Error sharing habit:", error);
    alert("Failed to share. Please try again.");
  }
}

// Helper function to download image
function downloadImage(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


