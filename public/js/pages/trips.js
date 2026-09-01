import { createNavbar } from "../components/navbar.js";
import { createElement, createConfirmModal } from "../reusable/functions.js";
import { createReviewModal } from "../components/tripsModal.js";

const navBarContainer =
  document.getElementById("navbar-container");

const tripsContainer =
  document.getElementById("trips-container");

const upcomingButton =
  document.getElementById("upcoming-trips-button");

const pastButton =
  document.getElementById("past-trips-button");


let trips = {
  upcoming: [],
  past: []
};

async function loadNavbar() {
    try {
      const response = await fetch("/api/me");
  
      if (!response.ok) {
        throw new Error("Unable to load user.");
      }
  
      const user = await response.json();
  
      if (!user) {
        window.location.href = "/";
        return;
      }
  
      const navbar = createNavbar({
        userMode: "tenant",
        isRegisteredHost: user.host ?? false,
        user: user,
      });
  
      navBarContainer.appendChild(navbar);
  
    } catch (error) {
      console.error("Error loading Trips navbar:", error);
    }
  }


function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  ).format(date);
}

function formatDateRange(startDate, endDate) {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function formatStatus(status) {
  if (!status) {
    return "";
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}


async function loadTrips() {
  try {
    const response = await fetch(
      "/api/trips"
    );
    if (!response.ok) {
      throw new Error(
        "Failed to load trips"
      );
    }
    const data = await response.json();
    trips.upcoming =
      Array.isArray(data.upcoming)
        ? data.upcoming
        : [];
    trips.past =
      Array.isArray(data.past)
        ? data.past
        : [];
    renderTrips("upcoming");
  } catch (error) {
    console.error(
      "Error loading trips:",
      error
    );
    tripsContainer.replaceChildren(
      createElement("p", {
        textContent:
          "Unable to load your trips."
      })
    );
  }
}

function createTripCard(trip) {

  const card = createElement("article", {
    className: "trip-card"
  });


  const image = createElement("img", {
    className: "trip-image",
    src:
      trip.image_url ||
      "/assets/placeholders/default_home.jpg",
    alt: trip.title
  });

  const content = createElement("div", {
    className: "trip-content"
  });

  const title = createElement("h2", {
    textContent: trip.title
  });

  const location = createElement("p", {
    className: "trip-location",
    textContent:
      `${trip.city}, ${trip.state}`
  });


  const dates = createElement("p", {
    className: "trip-dates",
    textContent: formatDateRange(
      trip.start_date,
      trip.end_date
    )
  });

  const host = createElement("p", {
    className: "trip-host",
    textContent:
      `Hosted by ${trip.host_first_name} ${trip.host_last_name}`
  });

  let reviewSection = null;

  if (trip.status === "completed") {
    if (trip.review_id) {
      reviewSection = createElement("div", {
        className: "trip-review"
      });

      const stars = createElement("p", {
        className: "trip-review-stars",
        textContent:
          "★".repeat(trip.review_rating) +
          "☆".repeat(5 - trip.review_rating)
      });

      reviewSection.appendChild(stars);
      if (trip.review_comment) {
        const comment = createElement("p", {
          className: "trip-review-comment",
          textContent: trip.review_comment
        });
        reviewSection.appendChild(comment);
      }
    } else {
      reviewSection = createElement("button", {
        type: "button",
        className: "write-review-button",
        textContent: "Write a review"
      });

      reviewSection.addEventListener("click", (event) => {
        event.stopPropagation();
        createReviewModal(trip, () => {
          renderTrips("past");
        });
      });
    }
  }

  const total = createElement("p", {
    className: "trip-total",
    textContent:
      `$${Number(
        trip.total_price
      ).toFixed(2)} total`
  });

  const status = createElement("p", {
    className:
      `trip-status trip-status-${trip.status}`,
    textContent:
      formatStatus(trip.status)
  });

  content.append(
    title,
    location,
    dates,
    host,
    total,
    status
  );


  if (reviewSection) {
    content.appendChild(reviewSection);
  }

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const canCancel =
    (trip.status === "pending" || trip.status === "confirmed") &&
    trip.start_date &&
    new Date(`${trip.start_date}T00:00:00`) > todayMidnight;

  if (canCancel) {
    const cancelButton = createElement("button", {
      type: "button",
      className: "cancel-booking-btn",
      textContent: "Cancel reservation"
    });

    cancelButton.addEventListener("click", async (event) => {
      event.stopPropagation();

      const confirmed = await createConfirmModal({
        title: "Cancel reservation",
        message: `Cancel your stay at ${trip.title}? This can't be undone.`,
        confirmText: "Cancel reservation",
        cancelText: "Keep reservation",
        danger: true
      });

      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch(
          `/api/bookings/${trip.booking_id}/cancel`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not cancel reservation"
          );
        }

        await loadTrips();
      } catch (error) {
        console.error("Error cancelling reservation:", error);
        window.alert(error.message);
      }
    });

    content.appendChild(cancelButton);
  }

  card.append(
    image,
    content
  );


  card.addEventListener(
    "click",
    () => {
      window.location.href =
        `/listing.html?id=${trip.property_id}`;

    }
  );
  return card;
}

function renderTrips(view) {
  tripsContainer.replaceChildren();
  const selectedTrips =
    trips[view];
  if (!selectedTrips.length) {
    const emptyContainer =
      createElement("div", {
        className: "trips-empty"
      });
    const image =
      createElement("img", {
        src:
          "/assets/placeholders/open-book.png",

        alt: "No trips"
      });


    const heading =
      createElement("h2", {
        textContent:
          view === "upcoming"
            ? "No upcoming trips"
            : "No past trips"
      });


    const description =
      createElement("p", {
        textContent:
          view === "upcoming"
            ? "When you book a stay, it will appear here."
            : "Trips you've completed will appear here."
      });


    emptyContainer.append(
      image,
      heading,
      description
    );


    tripsContainer.appendChild(
      emptyContainer
    );


    return;
  }


  const grid =
    createElement("div", {
      className: "trips-grid"
    });


  selectedTrips.forEach(
    (trip) => {

      grid.appendChild(
        createTripCard(trip)
      );

    }
  );

  tripsContainer.appendChild(grid);
}


function updateTab(view) {

  if (view === "upcoming") {

    upcomingButton.className =
      "option-button-selected";

    pastButton.className =
      "option-button-unselected";

  } else {

    upcomingButton.className =
      "option-button-unselected";

    pastButton.className =
      "option-button-selected";

  }
}


upcomingButton.addEventListener(
  "click",
  () => {

    updateTab("upcoming");

    renderTrips("upcoming");

  }
);


pastButton.addEventListener(
  "click",
  () => {

    updateTab("past");

    renderTrips("past");

  }
);

loadNavbar();
loadTrips();