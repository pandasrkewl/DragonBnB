import { createNavbar } from "../components/navbar.js";

const navElement = createNavbar({
  userMode: "tenant",
});

document.getElementById("navbar-container").appendChild(navElement);
