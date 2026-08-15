import { createNavbar } from "../components/navbar.js";

const navBarContainer = document.getElementById("navbar-container");
const today = document.getElementById("todayButton");
const upcoming = document.getElementById("upcomingButton");
const centerDiv = document.querySelector(".center-div");
const heading = centerDiv?.querySelector("h1");
const subheading = centerDiv?.querySelector("h4");
const image = centerDiv?.querySelector("img");

const navElement = createNavbar({
    userMode: 'host',
    activeHostTab: 0,
});

navBarContainer.appendChild(navElement);

const updateHostView = (view) => {
    if (!today || !upcoming || !heading || !subheading || !image) return;

    if (view === 'today') {
        today.className = 'option-button-selected';
        upcoming.className = 'option-button-unselected';
        heading.textContent = "You don't have any reservations";
        subheading.textContent =
            'Your place won’t appear in search results and can’t be booked. Relist to start earning.';
        image.src = '/assets/placeholders/open-book.png';
    } else {
        today.className = 'option-button-unselected';
        upcoming.className = 'option-button-selected';
        heading.textContent = "You don't have any upcoming reservations";
        subheading.textContent =
            'Once a guest books your space, upcoming stays will appear here.';
        image.src = '/assets/placeholders/open-book.png';
    }
};

if (today && upcoming) {
    today.addEventListener('click', () => updateHostView('today'));
    upcoming.addEventListener('click', () => updateHostView('upcoming'));
}

updateHostView('today');

console.log('hostToday script loaded');
