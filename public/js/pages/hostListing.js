import { createNavbar } from "../components/navbar.js";

const navBarContainer = document.getElementById("navbar-container");

const navElement = createNavbar({
  userMode: "host",
  activeHostTab: 2,
});

navBarContainer.appendChild(navElement);