import { createNavbar } from "../components/navbar.js";
import { createElement, createModal } from "../reusable/functions.js";

const navBarContainer = document.getElementById("navbar-container");
const today = document.getElementById("todayButton");
const upcoming = document.getElementById("upcomingButton");
const past = document.getElementById("pastButton");
const centerDiv = document.querySelector(".center-div");

let user = null;

async function validateAccount() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      window.location.replace("/");
      return;
    }

    user = await response.json();

    if (!user) {
      window.location.replace("/");
      return;
    }
  } catch (err) {
    console.error("Failed to validate account:", err);
    window.location.replace("/");
  }
}

await validateAccount();

const navElement = createNavbar({
  userMode: "host",
  activeHostTab: 0,
  user: user,
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

// Every rendered Past-tab rating widget, grouped by guest id, so that rating a
// guest on one reservation updates every other card for the same guest on the page.
const guestRatingWidgetsByGuest = new Map();

function registerGuestRatingWidget(guestId, controller) {
  if (!guestRatingWidgetsByGuest.has(guestId)) {
    guestRatingWidgetsByGuest.set(guestId, []);
  }
  guestRatingWidgetsByGuest.get(guestId).push(controller);
}

function syncGuestRatingWidgets(guestId, average, myRating) {
  const controllers = guestRatingWidgetsByGuest.get(guestId) || [];
  controllers.forEach((controller) => controller.update(average, myRating));
}

function createGuestRatingWidget(booking) {
  const guestId = booking.tenant_id;

  const widget = createElement("div", { className: "guest-rating-widget" });
  const label = createElement("div", { className: "guest-rating-label" });
  const starsContainer = createElement("div", { className: "review-stars" });
  const stars = [];

  let myRating = booking.my_guest_rating || 0;

  const setLabel = (average) => {
    label.textContent =
      average != null ? `Guest rating: ★ ${average}` : "Not rated yet";
  };

  const paintStars = (value) => {
    stars.forEach((star, index) => {
      const filled = index < value;
      star.textContent = filled ? "★" : "☆";
      star.classList.toggle("selected", filled);
    });
  };

  const update = (average, nextMyRating) => {
    if (nextMyRating != null) {
      myRating = nextMyRating;
    }
    setLabel(average);
    paintStars(myRating);
  };

  for (let i = 1; i <= 5; i++) {
    const star = createElement("button", {
      type: "button",
      className: "review-star",
      textContent: "☆",
    });

    star.addEventListener("click", async () => {
      try {
        const response = await fetch("/api/user-ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: guestId, rating: i }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not save rating");
        }

        syncGuestRatingWidgets(guestId, data.average, data.myRating);
      } catch (error) {
        console.error("Error saving guest rating:", error);
        window.alert(error.message);
      }
    });

    stars.push(star);
    starsContainer.appendChild(star);
  }

  setLabel(booking.guest_rating);
  paintStars(myRating);

  registerGuestRatingWidget(guestId, { update });

  widget.append(label, starsContainer);
  return widget;
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

async function cancelBooking(bookingId) {
  const confirmed = window.confirm("Cancel this confirmed booking? This will mark it as cancelled.");
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not cancel booking");
    }

    await renderBookings("upcoming");
  } catch (error) {
    console.error("Error cancelling booking:", error);
    window.alert(error.message);
  }
}

async function renderBookings(view) {
  if (!centerDiv) return;

  guestRatingWidgetsByGuest.clear();

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
    const statusValue = b.status || "confirmed";

    const imgUrl = b.image_url
      ? b.image_url.startsWith("/")
        ? b.image_url
        : `/${b.image_url}`
      : "/assets/placeholders/default_user.jpg";

    const cardImg = createElement("img", {
      src: imgUrl,
      className: "big-avatar"
    });

    const statusTag = createElement("div", {
      className: `trip-status trip-status-${statusValue}`,
      textContent: statusValue.charAt(0).toUpperCase() + statusValue.slice(1),
    });

    const content = createElement("div", {
      className: "listing-content",
    }, [
      createElement("h3", {
        textContent: `${b.first_name} ${b.last_name}`,
      }),
      createElement("div", {
        className: "trip-property",
        textContent: b.property_title || "Property",
      }),
      createElement("div", {
        className: "price",
        textContent: formatDateRange(b.start_date, b.end_date),
      }),
      statusTag,
    ]);

    const canCancel =
      statusValue === "confirmed" &&
      b.start_date &&
      new Date(b.start_date) > new Date(new Date().setHours(0, 0, 0, 0));

    if (canCancel) {
      const cancelButton = createElement("button", {
        className: "cancel-booking-btn",
        textContent: "Cancel booking",
      });
      cancelButton.addEventListener("click", () => cancelBooking(b.id));
      content.appendChild(cancelButton);
    }

    if (view === "past") {
      content.appendChild(createGuestRatingWidget(b));
    }

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