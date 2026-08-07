import { createNavbar } from "../components/navbar.js";
import { createRail } from "../components/rail.js";

import {loadProperties} from "../services/propertyService.js"

const navBarContainer = document.getElementById("navbar-container");
const catalog = document.getElementById("catalog");

async function loadNavbar() {
  try {
    const response = await fetch("/api/me");
    const user = await response.json();

    let userMode = "guest";

    if (user) {
      userMode = user.host ? "host" : "tenant";
    }

    const navElement = createNavbar({
      userMode,
      isRegisteredHost: user?.host ?? false,
    });

    document
      .getElementById("navbar-container")
      .appendChild(navElement);

  } catch (err) {
    console.error(err);

    const navElement = createNavbar({
      userMode: "guest",
    });

    document
      .getElementById("navbar-container")
      .appendChild(navElement);
  }

  navBarContainer.appendChild(navElement);
}

loadNavbar();
navBarContainer.appendChild(navElement);

const popularRail = createRail({rail_id: "popular-rail", rail_name: "Popular stays near Drexel"});
const affordableRail = createRail({rail_id: "affordable-rail", rail_name: "Affordable stays near Drexel"});
const atlanticCityRail = createRail({rail_id: "atlantic-city-rail", rail_name: "Popular stays in Atlantic City"});

catalog.append(popularRail, affordableRail, atlanticCityRail);

loadProperties("/api/properties?city=Philadelphia&sortBy=rating&limit=8", "popular-rail");
loadProperties("/api/properties?city=Philadelphia&sortBy=price_low&limit=8", "affordable-rail");
loadProperties("/api/properties?city=Atlantic%20City&sortBy=rating&limit=8", "atlantic-city-rail");
