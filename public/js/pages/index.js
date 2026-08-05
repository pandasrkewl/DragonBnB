import { createNavbar } from "../components/navbar.js";

const navElement = createNavbar({
  userMode: "tenant",
  profilePic: "../../../assets/placeholders/default_user.jpg",
});

document.getElementById("navbar-container").appendChild(navElement);
