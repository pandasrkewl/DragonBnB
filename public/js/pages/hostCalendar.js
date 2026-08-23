import { createNavbar } from "../components/navbar.js";
// Navbar
const navBarContainer = document.getElementById("navbar-container");
const navElement = createNavbar({
  userMode: "host",
  activeHostTab: 1,
});
navBarContainer.appendChild(navElement);

const today = new Date();
const currentYear = today.getFullYear();
let selectedMonth = today.getMonth();
let selectedYear = currentYear;
let pickerView = "month";

const calendarHeader = document.getElementById("calendar-header");
const monthDropdown = document.getElementById("month-dropdown");
const picker = document.getElementById("month-year-dropdown");
const calendarGrid = document.getElementById("calendar-grid");
const viewButtons = document.querySelectorAll("[data-view]");

function monthName(month, format = "long") {
  return new Intl.DateTimeFormat("en-US", { month: format }).format(new Date(2000, month, 1));
}

function renderPickerOptions() {
  picker.replaceChildren();
  if (pickerView === "month") {
    for (let month = 0; month < 12; month += 1) {
      const option = new Option(monthName(month), String(month));
      option.selected = month === selectedMonth;
      picker.appendChild(option);
    }
  } else {
    for (let year = currentYear - 1; year <= currentYear + 2; year += 1) {
      const option = new Option(String(year), String(year));
      option.selected = year === selectedYear;
      picker.appendChild(option);
    }
  }
}

function renderCalendar() {
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthLabel = monthName(selectedMonth);
  calendarHeader.textContent = `${monthLabel} ${selectedYear}`;
  calendarGrid.replaceChildren();

  for (let index = 0; index < firstDay; index += 1) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day calendar-day-empty";
    emptyCell.setAttribute("role", "gridcell");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(selectedYear, selectedMonth, day);
    const cell = document.createElement("div");
    const booked = (day + selectedMonth) % 7 === 0 || (day + selectedMonth) % 11 === 0;
    const isToday = date.toDateString() === today.toDateString();
    cell.className = `calendar-day ${booked ? "is-booked" : "is-open"} ${isToday ? "is-today" : ""}`;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `${monthLabel} ${day}, ${selectedYear}: ${booked ? "booked" : "available"}`);
    cell.innerHTML = `<span class="calendar-day-number">${day}</span><span class="calendar-day-status">${booked ? "Booked" : `$${125 + (day % 4) * 15}`}</span>`;
    calendarGrid.appendChild(cell);
  }
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    pickerView = button.dataset.view;
    viewButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderPickerOptions();
  });
});

picker.addEventListener("change", (event) => {
  if (pickerView === "month") {
    selectedMonth = Number(event.target.value);
  } else {
    selectedYear = Number(event.target.value);
  }
  renderCalendar();
});

renderPickerOptions();
renderCalendar();
