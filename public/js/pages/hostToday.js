import { createNavbar } from "../components/navbar.js";
import { createElement, createModal } from "../reusable/functions.js";

const navBarContainer = document.getElementById("navbar-container");
const today = document.getElementById("todayButton");
const upcoming = document.getElementById("upcomingButton");
const past = document.getElementById("pastButton");
const centerDiv = document.querySelector(".center-div");

async function validateAccount() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      window.location.replace("/");
      return;
    }

    const body = await response.json();

    if (!body) {
      window.location.replace("/");
      return;
    }
  } catch (err) {
    console.error("Failed to validate account:", err);
    window.location.replace("/");
  }
}

validateAccount();

const navElement = createNavbar({
  userMode: "host",
  activeHostTab: 0,
});

navBarContainer.appendChild(navElement);

//Switching between tabs
const updateHostView = (view) => {
  if (!today || !upcoming || !past) return;

  today.className =
    view === "today"
      ? "option-button-selected"
      : "option-button-unselected";

  upcoming.className =
    view === "upcoming"
      ? "option-button-selected"
      : "option-button-unselected";

  past.className =
    view === "past"
      ? "option-button-selected"
      : "option-button-unselected";
};


if (today && upcoming && past) {
  today.addEventListener("click", async () => {
    updateHostView("today");
    await renderBookings("today");
  });

  upcoming.addEventListener("click", async () => {
    updateHostView("upcoming");
    await renderBookings("upcoming");
  });

  past.addEventListener("click", async () => {
    updateHostView("past");
    await renderBookings("past");
  });
}


updateHostView("today");
renderBookings("today");

// ISO-aware date label helper (keeps existing functions intact but uses this for display)
function formatDateLabelISO(value) {
  if (!value) return "Add dates";
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date = new Date(`${value}T00:00:00`);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) {
    console.error("Invalid date:", value);
    return "Invalid date";
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" , year: "numeric"}).format(date);
}


function formatDateRange(checkIn, checkOut) {
  if (!checkIn && !checkOut) return "Add dates";

  if (checkIn && checkOut) {
    return `${formatDateLabelISO(checkIn)} – ${formatDateLabelISO(checkOut)}`;
  }

  return checkIn
    ? `${formatDateLabelISO(checkIn)} – Add date`
    : `Add date – ${formatDateLabelISO(checkOut)}`;
}

function buildBookingsModal(bookings) {
  const container = createElement("div", { className: "bookings-list" });

  if (!bookings.length) {
    container.appendChild(
      createElement("p", { textContent: "No bookings for today." }),
    );
    return createModal("Today's bookings", container);
  }

  bookings.forEach((b) => {
    const imgUrl = b.image_url ? (b.image_url.startsWith("/") ? b.image_url : `/${b.image_url}`) : "/assets/placeholders/default_user.jpg";
    const row = createElement("div", { className: "review-card" });
    const left = createElement("div", { className: "host-section" }, [
      createElement("img", { src: imgUrl, className: "host-image" }),
      createElement("div", { className: "host-info" }, [
        createElement("div", { className: "host-name", textContent: `${b.first_name} ${b.last_name}` }),
        createElement("div", { className: "host-details", textContent: formatDateRange(b.start_date, b.end_date) }),
      ]),
    ]);

    row.appendChild(left);
    container.appendChild(row);
  });

  return createModal("Today's bookings", container);
}

async function fetchBookings(view) {

  try {
    const endpoint =
      view === "today"
        ? "/api/host/bookings/today"
        : view === "upcoming"
          ? "/api/host/bookings/upcoming"
          : "/api/host/bookings/past";

    const res = await fetch(endpoint);

    if (!res.ok) {
      console.warn(`Could not fetch ${view} bookings:`, res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Error fetching ${view} bookings:`, err);
    return [];
  }
}

async function renderBookings(view) {
  if (!centerDiv) return;

  const bookings = await fetchBookings(view);

  if (!bookings.length) {
    centerDiv.replaceChildren();

    let headingText;
    let subheadingText;
    
    if (view === "today") {
      headingText =
        "You don't have any reservations today";
    
      subheadingText =
        "Reservations happening today will appear here.";
    
    } else if (view === "upcoming") {
      headingText =
        "You don't have any upcoming reservations";
    
      subheadingText =
        "Once a guest books your space, upcoming stays will appear here.";
    
    } else {
      headingText =
        "You don't have any past reservations";
    
      subheadingText =
        "Completed reservations will appear here.";
    }
    
    
    const newHeading = createElement("h1", {
      textContent: headingText
    });
    
    const newSubheading = createElement("h4", {
      textContent: subheadingText
    });

    const newImage = createElement("img", {
      src: "/assets/placeholders/open-book.png",
    });

    centerDiv.appendChild(newHeading);
    centerDiv.appendChild(newSubheading);
    centerDiv.appendChild(newImage);

    return;
  }

  const grid = createElement("div", {
    className: "listing-grid",
  });

  bookings.forEach((b) => {
    const imgUrl = b.image_url
      ? b.image_url.startsWith("/")
        ? b.image_url
        : `/${b.image_url}`
      : "/assets/placeholders/default_user.jpg";

    const cardImg = createElement("img", {
      src: imgUrl,
      className: "big-avatar"
    });

    const content = createElement("div", {
      className: "listing-content",
    }, [
      createElement("h3", {
        textContent: `${b.first_name} ${b.last_name}`,
      }),
      createElement("div", {
        className: "price",
        textContent: formatDateRange(b.start_date, b.end_date),
      }),
    ]);

    const card = createElement("div", {
      className: "listing-card",
    }, [
      cardImg,
      content,
    ]);

    grid.appendChild(card);
  });

  centerDiv.replaceChildren(grid);
}