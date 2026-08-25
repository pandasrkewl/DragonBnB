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

let date = startOfToday();
let month = getMonth(date);
let year = getYear(date);
let weekday = getDay(date);
let startDay = getDate(startOfMonth(date));
let endDay = getDate(endOfMonth(date));

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

setPropertySelector(0);

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

function updateAvailabilitySettings() {
  availabilitySettings.innerHTML = "";

  if(timePeriodsSelected) {
    return;
  } else {
    return;
  }
}

// Calendar

