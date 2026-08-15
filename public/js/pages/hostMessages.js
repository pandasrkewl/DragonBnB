import { createNavbar } from "../components/navbar.js";

const navBarContainer = document.getElementById("navbar-container");

const navElement = createNavbar({
  userMode: "host",
  activeHostTab: 3,
});

navBarContainer.appendChild(navElement);