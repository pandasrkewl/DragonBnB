import { createNavbar } from "../components/navbar.js";
import { createRail } from "../components/rail.js";

import { loadProperties } from "../services/propertyService.js";

const navBarContainer = document.getElementById("navbar-container");
const catalog = document.getElementById("catalog");

async function loadNavbar() {
  let navElement = document.createElement("div");
  try {
    const response = await fetch("/api/me");
    const user = await response.json();
    const userMode = user ? "tenant" : "guest";
    navElement = createNavbar({
      userMode: userMode,
      isRegisteredHost: user?.host ?? false,
      user: user,
    });
  } catch (err) {
    console.error(err);

    navElement = createNavbar({
      userMode: "guest",
      user: user,
    });
  }

  navBarContainer.appendChild(navElement);
}

loadNavbar();

const popularRail = createRail({
  rail_id: "popular-rail",
  rail_name: "Popular stays near Drexel",
});
const affordableRail = createRail({
  rail_id: "affordable-rail",
  rail_name: "Affordable stays near Drexel",
});
const atlanticCityRail = createRail({
  rail_id: "atlantic-city-rail",
  rail_name: "Popular stays in Atlantic City",
});

catalog.append(popularRail, affordableRail, atlanticCityRail);

loadProperties(
  "/api/properties?location=Philadelphia&sortBy=rating&limit=8",
  "popular-rail",
);
loadProperties(
  "/api/properties?location=Philadelphia&sortBy=price_low&limit=8",
  "affordable-rail",
);
loadProperties(
  "/api/properties?location=Atlantic%20City&sortBy=rating&limit=8",
  "atlantic-city-rail",
);
