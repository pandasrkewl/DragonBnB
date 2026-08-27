import { createNavbar } from "../components/navbar.js";
import { createElement } from "../reusable/functions.js";
import { 
  getDay,
  getDate,
  startOfMonth,
  endOfMonth,
  getMonth,
  getYear,
  startOfToday 
} from "https://cdn.jsdelivr.net/npm/date-fns/+esm";


// Navbar
const navBarContainer = document.getElementById("navbar-container");
const navElement = createNavbar({
  userMode: "host",
  activeHostTab: 1,
});
navBarContainer.appendChild(navElement);

//Get User Info

let user = null;

async function validateAccount() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      window.location.replace("/");
      return;
    }

    user = await response.json();

    if (!user) {
      window.location.replace("/");
      return;
    }
  } catch (err) {
    console.error("Failed to validate account:", err);
    window.location.replace("/");
  }
}

await validateAccount();
console.log(user);

// Current Date

// Constants

let today = startOfToday();
let month = getMonth(today);
let year = getYear(today);
let weekday = getDay(today);
let startDay = getDate(startOfMonth(today));
let endDay = getDate(endOfMonth(today));

const monthIndexToName = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December"
}

// Variables

let timePeriodsSelected = false;
let selectedDayAvailability = [];
let selectedDayKeys = [];
let availabilityByDate = new Map();
let pendingAvailabilityAction = null;
let availabilityChanged = false;

// Components

// Selecting a month (if filter is "month") or a year (if filter is "year") to show

const monthDropdown = document.getElementById("month-dropdown");
const yearDropdown = document.getElementById("year-dropdown");

function setMonthDropdown() {
  monthDropdown.innerHTML = "";

  for (const [index, name] of Object.entries(monthIndexToName)) {
    const option = document.createElement("option");

    option.value = index;
    option.textContent = name;

    monthDropdown.appendChild(option);
  }

  monthDropdown.value = month;
}
function setYearDropdown() {
  yearDropdown.innerHTML = "";

  for (const yearOption of [year - 1, year, year + 1]) {
    const option = document.createElement("option");

    option.value = yearOption;
    option.textContent = yearOption;

    yearDropdown.appendChild(option);
  }

  yearDropdown.value = year;
}

setMonthDropdown();
setYearDropdown();

monthDropdown.addEventListener("change", (event) => {
  updateCalendarByMonth(Number(event.target.value));
});

yearDropdown.addEventListener("change", (event) => {
  year = Number(event.target.value);
  updateCalendarByMonth(month);
});

// Pricing Settings

const pricePerNight = document.getElementById("price-per-night");
const priceSaveButton = document.getElementById("price-save-button");
let pendingPropertyId = null;

function updatePricePerNight(propertyId) {
  pendingPropertyId = propertyId;
  priceSaveButton.disabled = false;
}

priceSaveButton.addEventListener("click", async () => {
    const rawPrice = pricePerNight.value.trim();
    const price = Number(rawPrice);

    if (!rawPrice || !Number.isFinite(price) || price < 0) {
      pricePerNight.setCustomValidity("Enter a valid price of 0 or more.");
      pricePerNight.reportValidity();
      return;
    }

    pricePerNight.setCustomValidity("");
    priceSaveButton.disabled = true;

    try {
      const response = await fetch(`/api/host/properties/${pendingPropertyId}/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_per_night: price }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Could not save price");
      }

      const data = await response.json();
      pricePerNight.value = Number(data.property.price_per_night).toFixed(2);
      properties[selectedPropertyIndex].price_per_night = data.property.price_per_night;
    } catch (error) {
      console.error("Error saving property price:", error);
      priceSaveButton.disabled = false;
      alert(error.message);
    }
  });

// Property Selector

const propertySelector = document.getElementById("property-selector");
const tbody = document.getElementById("calendar-rows");
let selectedPropertyIndex = 0;

async function getPropertyImages() {
  try {
    const res = await fetch(`/api/property_images/${user.id}`);

    if (!res.ok) {
      console.warn(`Could not fetch property images:`, res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Error fetching property images:`, err);
    return [];
  }
}

let properties = await getPropertyImages();
let bookingsByProperty = new Map();
let blockingsByProperty = new Map();

async function setPropertySelector(propertyIndex) {
  if (propertySelector.children.length !== 0) {
    for (let i = 0; i < propertySelector.children.length; i++) {
      const node = propertySelector.children[i];
      if (i === propertyIndex) {
        node.className = "property-option active";
        selectedPropertyIndex = propertyIndex;
      } else {
        node.className = "property-option";
      }
    }

    const property = properties[propertyIndex];
    pricePerNight.value = property.price_per_night;
    pendingPropertyId = null;
    priceSaveButton.disabled = true;
    selectedDayKeys = [];
    selectedDayAvailability = [];
    pendingAvailabilityAction = null;
      availabilityChanged = false;
      blockingReason.value = "";
    await Promise.all([
      loadPropertyBookings(property.property_id),
      loadPropertyBlockings(property.property_id),
    ]);
    updateCalendarByMonth(month);
  }
}

async function loadPropertyBlockings(propertyId) {
  try {
    const response = await fetch(`/api/properties/${propertyId}/blockings`);
    if (!response.ok) {
      throw new Error(`Could not load blockings: ${response.status}`);
    }

    const blockings = await response.json();
    blockingsByProperty.set(propertyId, Array.isArray(blockings) ? blockings : []);
  } catch (error) {
    console.error("Error loading property blockings:", error);
    blockingsByProperty.set(propertyId, []);
  }
}

async function loadPropertyBookings(propertyId) {
  try {
    const response = await fetch(`/api/properties/${propertyId}/bookings`);
    if (!response.ok) {
      throw new Error(`Could not load bookings: ${response.status}`);
    }

    const bookings = await response.json();
    bookingsByProperty.set(propertyId, Array.isArray(bookings) ? bookings : []);
  } catch (error) {
    console.error("Error loading property bookings:", error);
    bookingsByProperty.set(propertyId, []);
  }
}

properties.forEach((property, index) => {
  let propertyButton = createElement("button", {
    className: index === 0
        ? "property-option active"
        : "property-option"
  });

  propertyButton.dataset.propertyId = property.property_id;

  let propertyImage = createElement("img", {
    src: property.image_url,
    alt: "Property"
  });

  propertyButton.appendChild(propertyImage);
  propertyButton.addEventListener("click", async () => {
    await setPropertySelector(index);
  });
  propertySelector.appendChild(propertyButton);
});

pricePerNight.addEventListener("input", () => {
  const property = properties[selectedPropertyIndex];
  if (property) {
    updatePricePerNight(property.property_id);
  }
});

// Availability settings
// Available or not
// New booking price

const availabilitySettings = document.getElementById("availability-settings");
const availabilityToggle = document.getElementById("availability-toggle");
const availabilitySaveButton = document.getElementById("availability-save-button");
const blockingReason = document.getElementById("blocking-reason");

function setAvailabilitySaveState(enabled) {
  availabilitySaveButton.disabled = !enabled;
}

function updateAvailabilitySettings() {
  availabilityToggle.replaceChildren();

  timePeriodsSelected = selectedDayAvailability.length > 0;
  setAvailabilitySaveState(timePeriodsSelected && availabilityChanged);
  if (!timePeriodsSelected) {
    blockingReason.disabled = true;
    blockingReason.value = "";
    return;
  }

  const clearSelectionButton = createElement("button", {
    className: "availability-clear-selection",
    textContent: "Unselect all days",
    type: "button",
  });
  clearSelectionButton.addEventListener("click", () => {
    selectedDayKeys = [];
    selectedDayAvailability = [];
    pendingAvailabilityAction = null;
    availabilityChanged = false;
    blockingReason.value = "";
    updateCalendarDayStyles();
    updateAvailabilitySettings();
  });
  availabilityToggle.appendChild(clearSelectionButton);

  const availableDays = selectedDayAvailability.filter(Boolean).length;
  const blockedDays = selectedDayAvailability.length - availableDays;
  const canEditReason = blockedDays > 0 &&
    (availableDays === 0 || pendingAvailabilityAction === "block");
  blockingReason.disabled = !canEditReason;
  if (!canEditReason) {
    blockingReason.value = "";
  }

  if (blockedDays === 0 || availableDays === 0) {
    const isAvailable = availableDays > 0;
    const toggleLabel = createElement("label", {
      className: "availability-toggle-label",
    });
    const toggle = createElement("input", {
      className: "availability-toggle-input",
      type: "checkbox",
    });
    const toggleTrack = createElement("span", {
      className: "availability-toggle-track",
    });
    const status = createElement("span", {
      className: "availability-status",
      textContent: isAvailable ? "Available" : "Unavailable",
    });

    toggle.checked = isAvailable;
    toggle.addEventListener("change", () => {
      selectedDayKeys.forEach((dayKey) => {
        availabilityByDate.set(dayKey, toggle.checked);
      });
      selectedDayAvailability = selectedDayKeys.map((dayKey) => availabilityByDate.get(dayKey));
      availabilityChanged = true;
      updateCalendarDayStyles();
      updateAvailabilitySettings();
    });

    toggleLabel.append(toggle, toggleTrack, status);
    availabilityToggle.appendChild(toggleLabel);
    return;
  }

  const mixedSummary = createElement("p", {
    className: "availability-mixed-summary",
    textContent: `${availableDays} available, ${blockedDays} blocked`,
  });
  const actionContainer = createElement("div", {
    className: "availability-actions",
  });

  [
    ["block", "Block all days"],
    ["open", "Open all days"],
  ].forEach(([action, text]) => {
    const actionButton = createElement("button", {
      className: pendingAvailabilityAction === action
        ? "availability-action selected"
        : "availability-action",
      textContent: text,
      type: "button",
    });
    actionButton.addEventListener("click", () => {
      pendingAvailabilityAction = action;
      availabilityChanged = true;
      updateAvailabilitySettings();
    });
    actionContainer.appendChild(actionButton);
  });

  availabilityToggle.append(mixedSummary, actionContainer);
}

updateAvailabilitySettings();

availabilitySaveButton.addEventListener("click", async () => {
  const propertyId = properties[selectedPropertyIndex]?.property_id;
  const pendingAvailability = pendingAvailabilityAction === "open"
    ? true
    : pendingAvailabilityAction === "block"
      ? false
      : null;

  const dates = selectedDayKeys.map((dayKey) => ({
    date: dayKey.slice(String(propertyId).length + 1),
    available: pendingAvailability ?? availabilityByDate.get(dayKey) !== false,
  }));
  const reason = blockingReason.value.trim();

  if (!propertyId || dates.length === 0) {
    return;
  }

  setAvailabilitySaveState(false);
  try {
    const response = await fetch(`/api/host/properties/${propertyId}/blockings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates, reason }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Could not save availability");
    }

    await loadPropertyBlockings(propertyId);
    if (pendingAvailability !== null) {
      selectedDayKeys.forEach((dayKey) => {
        availabilityByDate.set(dayKey, pendingAvailability);
      });
      selectedDayAvailability = selectedDayKeys.map((dayKey) => availabilityByDate.get(dayKey));
    }
    pendingAvailabilityAction = null;
    availabilityChanged = false;
    updateCalendarDayStyles();
  } catch (error) {
    console.error("Error saving property availability:", error);
    setAvailabilitySaveState(true);
    alert(error.message);
  }
});

blockingReason.addEventListener("input", () => {
  if (selectedDayKeys.length > 0) {
    availabilityChanged = true;
    setAvailabilitySaveState(true);
  }
});

// Calendar

function updateCalendarByMonth(monthIndex) {
  let date = new Date(year, monthIndex, 1);
  month = getMonth(date);
  year = getYear(date);
  weekday = getDay(date);
  startDay = getDate(startOfMonth(date));
  endDay = getDate(endOfMonth(date));

  selectedDayKeys = [];
  selectedDayAvailability = [];
  pendingAvailabilityAction = null;
  setAvailabilitySaveState(false);
  updateAvailabilitySettings();
  tbody.replaceChildren();

  let row = createElement("tr");

  for (let blankDay = 0; blankDay < weekday; blankDay++) {
    row.appendChild(createElement("td", {
      className: "calendar-empty",
    }));
  }

  for (let day = 1; day <= endDay; day++) {
    if (row.children.length === 7) {
      tbody.appendChild(row);
      row = createElement("tr");
    }

    row.appendChild(createElement("td", {
      className: "calendar-day",
      textContent: day,
    }));
    const dayCell = row.lastElementChild;
    const dayKey = getCalendarDayKey(day);
    const calendarDate = new Date(year, month, day);
    const isPastDate = calendarDate < startOfToday();
    const isBookedDate = isDateBooked(day);
    const isBlockedDate = isDateBlocked(day);

    dayCell.dataset.dateKey = dayKey;
    if (isBlockedDate && !availabilityByDate.has(dayKey)) {
      availabilityByDate.set(dayKey, false);
    }
    dayCell.classList.add(availabilityByDate.get(dayKey) === false ? "blocked" : "available");

    if (isBookedDate) {
      dayCell.classList.add("booked");
      dayCell.setAttribute("aria-disabled", "true");
      dayCell.title = "Booked";
    } else if (isPastDate) {
      dayCell.classList.add("past");
      dayCell.setAttribute("aria-disabled", "true");
    } else {
        dayCell.addEventListener("click", () => selectCalendarDay(dayKey, dayCell, day));
    }
  }

  while (row.children.length > 0 && row.children.length < 7) {
    row.appendChild(createElement("td", {
      className: "calendar-empty",
    }));
  }

  if (row.children.length > 0) {
    tbody.appendChild(row);
  }
}

function getCalendarDayKey(day) {
  const propertyId = properties[selectedPropertyIndex]?.property_id || "property";
  const monthNumber = String(month + 1).padStart(2, "0");
  const dayNumber = String(day).padStart(2, "0");
  return `${propertyId}-${year}-${monthNumber}-${dayNumber}`;
}

function isDateBooked(day) {
  const propertyId = properties[selectedPropertyIndex]?.property_id;
  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const bookings = bookingsByProperty.get(propertyId) || [];

  return bookings.some((period) => {
    const startDate = String(period.start_date).slice(0, 10);
    const endDate = String(period.end_date).slice(0, 10);
    return dateKey >= startDate && dateKey < endDate;
  });
}

function isDateBlocked(day) {
  return Boolean(getBlockingForDate(day));
}

function getBlockingForDate(day) {
  const propertyId = properties[selectedPropertyIndex]?.property_id;
  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const blockings = blockingsByProperty.get(propertyId) || [];

  return blockings.find((blocking) => {
    const startDate = String(blocking.start_date).slice(0, 10);
    const endDate = String(blocking.end_date).slice(0, 10);
    return dateKey >= startDate && dateKey < endDate;
  });
}

function selectCalendarDay(dayKey, dayCell, day) {
  const selectedIndex = selectedDayKeys.indexOf(dayKey);

  if (selectedIndex === -1) {
    selectedDayKeys.push(dayKey);
    const blocking = getBlockingForDate(day);
    const isAvailable = availabilityByDate.has(dayKey)
      ? availabilityByDate.get(dayKey)
      : !blocking;
    availabilityByDate.set(dayKey, isAvailable);
    blockingReason.value = blocking?.reason || "";
    dayCell.classList.add("selected");
  } else {
    selectedDayKeys.splice(selectedIndex, 1);
    dayCell.classList.remove("selected");
  }

  selectedDayAvailability = selectedDayKeys.map((selectedKey) => availabilityByDate.get(selectedKey));
  pendingAvailabilityAction = null;
  updateAvailabilitySettings();
}

function updateCalendarDayStyles() {
  tbody.querySelectorAll(".calendar-day").forEach((dayCell) => {
    const dayKey = dayCell.dataset.dateKey;
    dayCell.classList.toggle("selected", selectedDayKeys.includes(dayKey));
    dayCell.classList.toggle("blocked", availabilityByDate.get(dayKey) === false);
    dayCell.classList.toggle("available", availabilityByDate.get(dayKey) !== false);
  });
}

await setPropertySelector(0);


