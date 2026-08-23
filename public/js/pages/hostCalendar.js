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

const monthIndexToName = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December"
}

const monthYearDropdown = document.getElementById("month-year-dropdown");
const chooseMonthOrYear = document.getElementById("calendar-filter");

function setMonthDropdown() {
  monthYearDropdown.innerHTML = "";

  for (const [index, name] of Object.entries(monthIndexToName)) {
    const option = document.createElement("option");

    option.value = index;
    option.textContent = name;

    monthYearDropdown.appendChild(option);
  }

  monthYearDropdown.value = month;
}
function setYearDropdown() {
  monthYearDropdown.innerHTML = "";

  for (const yearOption of [year-1, year, year+1]) {
    const option = document.createElement("option");

    option.value = yearOption;
    option.textContent = yearOption;

    monthYearDropdown.appendChild(option);
  }

  monthYearDropdown.value = year;
}

chooseMonthOrYear.addEventListener("change", (event) => {
  const selection = event.target.value;

  if (selection === "month") {
    setMonthDropdown();
  } else if (selection === "year") {
    setYearDropdown();
  }
});

setMonthDropdown();
chooseMonthOrYear.value = "month";

monthYearDropdown.addEventListener("change", (event) => {
  const selection = Number(event.target.value);
});