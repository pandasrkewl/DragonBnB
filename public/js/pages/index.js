import { createNavbar } from "../components/navbar.js";

const navElement = createNavbar({
  userMode: "host",
});

document.getElementById("navbar-container").appendChild(navElement);
