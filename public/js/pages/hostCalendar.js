import { createNavbar } from "../components/navbar.js";
import { 
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

// Current Date

let date = startOfToday();
let month = getMonth(date);
let year = getYear(date);
console.log(date);
console.log(month);
console.log(year);