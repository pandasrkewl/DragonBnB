import { createNavbar } from "../components/navbar.js";
import { createPropertyCard } from "../components/propertyCard.js";
import { createElement } from "../reusable/functions.js";

const navBarContainer = document.getElementById("navbar-container");
const resultsHeader = document.getElementById("results-header");
const resultsGrid = document.getElementById("results-grid");

const response = await fetch("/api/me");
const user = await response.json();

let userMode = user? "tenant" : "guest";

const navElement = createNavbar({
  userMode,
  isRegisteredHost: user?.host ?? false,
});

navBarContainer.appendChild(navElement);

const params = new URLSearchParams(window.location.search);
const location = params.get("location") || "";
const checkIn = params.get("checkIn") || "";
const checkOut = params.get("checkOut") || "";
const guests = params.get("guests") || "";
const adults = params.get("adults") || "";
const children = params.get("children") || "";
const infants = params.get("infants") || "";
const pets = params.get("pets") || "";

const query = new URLSearchParams({
  location,
  checkIn,
  checkOut,
  guests,
  adults,
  children,
  infants,
  pets,
});

const hasFilters = Boolean(
  location ||
  checkIn ||
  checkOut ||
  guests ||
  adults ||
  children ||
  infants ||
  pets,
);
const title = hasFilters
  ? location
    ? `Stays in ${location}`
    : "Search results"
  : "All listings";

const headerTitle = createElement("h1", { textContent: title });
const headerDescription = createElement("p", {
  textContent: hasFilters
    ? checkIn || checkOut
      ? "Filtered by your selected dates and guest preferences."
      : "Filtered by your selected location and guest preferences."
    : "Showing all available listings.",
});

resultsHeader.replaceChildren(headerTitle, headerDescription);

fetch(`/api/properties?${query.toString()}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not load results");
    }
    return response.json();
  })
  .then((properties) => {
    if (!properties.length) {
      const emptyState = createElement("div", {
        className: "empty-state",
        textContent:
          "No listings matched your search yet. Try broadening your criteria.",
      });
      resultsGrid.replaceChildren(emptyState);
      return;
    }

    resultsGrid.replaceChildren();

    properties.forEach((property) => {
      const card = createPropertyCard(property);
      resultsGrid.appendChild(card);
    });
  })
  .catch((error) => {
    console.error(error);
    const errorState = createElement("div", {
      className: "empty-state",
      textContent: "We could not load the results right now.",
    });
    resultsGrid.replaceChildren(errorState);
  });
