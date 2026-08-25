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

let monthOrYearFilter = "month";
let timePeriodsSelected = false;
let selectedDayAvailability = [];
let selectedDayKeys = [];
let availabilityByDate = new Map();
let pendingAvailabilityAction = null;

// Components

// Selecting a month (if filter is "month") or a year (if filter is "year") to show

const monthYearDropdown = document.getElementById("month-year-dropdown");

function setMonthDropdown() {
  monthYearDropdown.innerHTML = "";

  for (const [index, name] of Object.entries(monthIndexToName)) {
    const option = document.createElement("option");

    option.value = index;
    option.textContent = name;

    monthYearDropdown.appendChild(option);
  }

  monthYearDropdown.value = month;
}
function setYearDropdown() {
  monthYearDropdown.innerHTML = "";

  for (const yearOption of [year-1, year, year+1]) {
    const option = document.createElement("option");

    option.value = yearOption;
    option.textContent = yearOption;

    monthYearDropdown.appendChild(option);
  }

  monthYearDropdown.value = year;
}

// Choosing to display a month at a tim or the year at a time

const chooseMonthOrYear = document.getElementById("calendar-filter");

chooseMonthOrYear.addEventListener("change", (event) => {
  monthOrYearFilter = event.target.value;


  if (monthOrYearFilter === "month") {
    setMonthDropdown();
  } else if (monthOrYearFilter === "year") {
    setYearDropdown();
  }
});

setMonthDropdown();
chooseMonthOrYear.value = "month";

monthYearDropdown.addEventListener("change", (event) => {
  const selection = Number(event.target.value);

  if (monthOrYearFilter === "month") {
    updateCalendarByMonth(selection);
  } else {
    year = selection;
    updateCalendarByMonth(month);
  }
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

function setPropertySelector(propertyIndex) {
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
    updateCalendarByMonth(month);
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
  propertyButton.addEventListener("click", () => {
    setPropertySelector(index);
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

function updateAvailabilitySettings() {
  availabilityToggle.replaceChildren();

  timePeriodsSelected = selectedDayAvailability.length > 0;
  if (!timePeriodsSelected) {
    return;
  }

  const availableDays = selectedDayAvailability.filter(Boolean).length;
  const blockedDays = selectedDayAvailability.length - availableDays;

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
      updateAvailabilitySettings();
    });
    actionContainer.appendChild(actionButton);
  });

  const confirmButton = createElement("button", {
    className: "availability-confirm",
    textContent: "Confirm",
    type: "button",
  });
  confirmButton.disabled = pendingAvailabilityAction === null;
  confirmButton.addEventListener("click", () => {
    if (!pendingAvailabilityAction) {
      return;
    }

    const makeAvailable = pendingAvailabilityAction === "open";
    selectedDayKeys.forEach((dayKey) => {
      availabilityByDate.set(dayKey, makeAvailable);
    });
    selectedDayAvailability = selectedDayKeys.map((dayKey) => availabilityByDate.get(dayKey));
    pendingAvailabilityAction = null;
    updateCalendarDayStyles();
    updateAvailabilitySettings();
  });

  availabilityToggle.append(mixedSummary, actionContainer, confirmButton);
}

updateAvailabilitySettings();

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

    dayCell.dataset.dateKey = dayKey;
    dayCell.classList.add(availabilityByDate.get(dayKey) === false ? "blocked" : "available");

    if (isPastDate) {
      dayCell.classList.add("past");
      dayCell.setAttribute("aria-disabled", "true");
    } else {
      dayCell.addEventListener("click", () => selectCalendarDay(dayKey, dayCell));
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

function selectCalendarDay(dayKey, dayCell) {
  const selectedIndex = selectedDayKeys.indexOf(dayKey);

  if (selectedIndex === -1) {
    selectedDayKeys.push(dayKey);
    availabilityByDate.set(dayKey, availabilityByDate.get(dayKey) !== false);
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

setPropertySelector(0);


