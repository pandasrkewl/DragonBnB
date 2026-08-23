import { createNavbar } from "../components/navbar.js";
import { 
  format,
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

let calendarHeader = document.getElementById("calendar-header");
calendarHeader.textContent = format(date, "MMMM");

const monthDropdown = document.getElementById("month-dropdown");

monthDropdown.addEventListener("change", (event) => {
    const month = Number(event.target.value);
    console.log(month);
});