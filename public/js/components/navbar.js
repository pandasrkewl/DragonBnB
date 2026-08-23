import { createElement } from "../reusable/functions.js";
import {createGuestPicker} from "./guestPicker.js";
import { createDatePicker } from "./datePicker.js";
import { createLoginModal } from "./loginModal.js";
import { createSignupModal } from "./signupModal.js";

function formatDateLabel(value) {
  if (!value) return "Add dates";

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateRange(checkIn, checkOut) {
  if (!checkIn && !checkOut) return "Add dates";
  if (checkIn && checkOut) {
    return `${formatDateLabel(checkIn)} – ${formatDateLabel(checkOut)}`;
  }
  return checkIn
    ? `${formatDateLabel(checkIn)} – Add date`
    : `Add date – ${formatDateLabel(checkOut)}`;
}

export function createNavbar({
  userMode = "guest",
  isRegisteredHost = false,
  activeHostTab = null,
  profilePic = "../../../assets/placeholders/default_user.jpg",
}) {
  const header = createElement("header", { className: "main-header" });

  const logoImg = createElement("img", {
    src: "../../../assets/icons/logo.svg",
    alt: "DrexelBNB Logo",
    className: "logo-icon",
  });
  const logoSpan = createElement("span", {
    className: "logo-text",
    textContent: "DrexelBNB",
  });
  const logoLink = createElement("a", { href: "/", className: "logo" }, [
    logoImg,
    logoSpan,
  ]);

  header.appendChild(logoLink);

  if (userMode === "host") {
    const hostTabs = [
      { text: "Today", href: "/host/today.html" },
      { text: "Calendar", href: "/host/calendar.html" },
      { text: "Listings", href: "/host/listings.html" },
      { text: "Messages", href: "/host/messages.html" },
    ];

    const hostNavLinks = hostTabs.map((tab, index) => {
      const className =
        index === activeHostTab ? "host-link active" : "host-link";
      return createElement("a", {
        href: tab.href,
        className,
        textContent: tab.text,
      });
    });

    const hostNav = createElement(
      "nav",
      { className: "host-nav-links" },
      hostNavLinks,
    );
    header.appendChild(hostNav);
  } else {
    const searchForm = createElement("form", {
      className: "search-bar",
    });

    const searchInput = createElement("input", {
            type: "text",
            placeholder: "Search location",
            id: "search-input",
          })

    const locationSegment = createElement(
      "div",
      { className: "search-segment search-segment-input" },
      [
        createElement("img", {
          src: "../../../assets/icons/location.svg",
          alt: "Location",
          className: "segment-icon",
        }),
        createElement("div", { className: "segment-text" }, [
          createElement("span", { className: "label", textContent: "Where" }),
          searchInput
        ]),
      ],
    );

    locationSegment.addEventListener("click", () => {searchInput.focus();});
    
    const dateSegment = createElement(
      "div",
      { className: "search-segment search-segment-picker" },
      [
        createElement("img", {
          src: "../../../assets/icons/calendar.svg",
          alt: "Calendar",
          className: "segment-icon",
        }),
        createElement("div", { className: "segment-text" }, [
          createElement("span", { className: "label", textContent: "When" }),
          createElement("span", {
            className: "search-value",
            textContent: "Add dates",
          }),
        ]),
      ],
    );

    const guestsSegment = createElement(
      "div",
      { className: "search-segment search-segment-picker" },
      [
        createElement("img", {
          src: "../../../assets/icons/person.svg",
          alt: "Guests",
          className: "segment-icon",
        }),
        createElement("div", { className: "segment-text" }, [
          createElement("span", { className: "label", textContent: "Guests" }),
          createElement("span", {
            className: "search-value",
            textContent: "Add guests",
          }),
        ]),
      ],
    );

    const searchBtn = createElement(
      "button",
      { className: "search-btn", type: "submit" },
      [
        createElement("img", {
          src: "../../../assets/icons/search.svg",
          alt: "Search",
        }),
      ],
    );

    const locationInput = locationSegment.querySelector("input");
    const locationValue = locationSegment.querySelector(".segment-text");
    const dateValue = dateSegment.querySelector(".search-value");
    const guestValue = guestsSegment.querySelector(".search-value");
    const suggestionsList = createElement("div", {
      className: "suggestion-list",
    });

    const datePicker = createDatePicker(null, null, () => {updateDateSummary();});
    const checkInInput = datePicker.checkIn;
    const checkOutInput = datePicker.checkOut;

    const datePanel = createElement(
      "div",
      { className: "search-dropdown date-dropdown" },
      [
        createElement("div", { className: "dropdown-header" }, [
          createElement("strong", {
            textContent: "Select dates"
          }),
        ]),
        datePicker.element
      ]
    );

    const guestsPanel = createElement(
      "div",
      { className: "search-dropdown guest-dropdown" },
      [
        createElement("div", { className: "dropdown-header" }, [
          createElement("strong", { textContent: "Who’s coming?" }),
        ]),
      ],
    );

  const guestPicker = createGuestPicker({}, () => {syncGuestSummary();});
  const guestCounts = guestPicker.guestCounts;
  guestsPanel.appendChild(guestPicker.element);


    const dateError = createElement("p", {
      className: "search-error",
      textContent: "",
    });
    datePanel.appendChild(dateError);

    function setDateError(message) {
      dateError.textContent = message;
      dateError.classList.toggle("visible", Boolean(message));
    }

    const guestError = createElement("p", {
      className: "search-error",
      textContent: "",
    });
    guestsPanel.appendChild(guestError);

    function setGuestError(message) {
      guestError.textContent = message;
      guestError.classList.toggle("visible", Boolean(message));
    }

    function isValidDateRange() {
      if (!checkInInput.value || !checkOutInput.value) {
        setDateError("");
        return true;
      }

      if (checkInInput.value > checkOutInput.value) {
        setDateError("Check-in must be on or before check-out.");
        return false;
      }

      setDateError("");
      return true;
    }

    function syncGuestSummary() {
      const totalGuests = guestCounts.adults + guestCounts.children;

      const hasMinorsOrPets =
        guestCounts.children > 0 ||
        guestCounts.infants > 0 ||
        guestCounts.pets > 0;
      if (hasMinorsOrPets && guestCounts.adults === 0) {
        setGuestError(
          "At least one adult must accompany children, infants, or pets.",
        );
      } else {
        setGuestError("");
      }

      if (totalGuests > 0) {
        guestValue.textContent = `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`;
      } else {
        guestValue.textContent = "Add guests";
      }

    }

    function updateDateSummary() {
      dateValue.textContent = formatDateRange(
        checkInInput.value,
        checkOutInput.value,
      );
      isValidDateRange();
    }

    function closePanels() {
      datePanel.classList.remove("open");
      guestsPanel.classList.remove("open");
      suggestionsList.classList.remove("open");
    }

    function openPanel(panel) {
      closePanels();

      if (panel === "date") {
        datePanel.classList.add("open");
        checkInInput.focus();
      } else if (panel === "guests") {
        guestsPanel.classList.add("open");
      } else if (panel === "location") {
        const value = locationInput.value.trim();
        loadSuggestions(value);
      }
    }

    async function loadSuggestions(query) {
      const value = query.trim();
      const url = `/api/search-suggestions${value ? `?query=${encodeURIComponent(value)}` : ""}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Unable to load suggestions");
        }
        const locations = await response.json();
        suggestionsList.replaceChildren();

        if (!locations.length) {
          const emptyItem = createElement(
            "div",
            { className: "suggestion-item disabled" },
            ["No matching cities found"],
          );
          suggestionsList.appendChild(emptyItem);
        } else {
          locations.forEach((city) => {
            const item = createElement("button", {
              type: "button",
              className: "suggestion-item",
              textContent: city,
            });
            item.addEventListener("click", () => {
              locationInput.value = city;
              closePanels();
            });
            suggestionsList.appendChild(item);
          });
        }

        suggestionsList.classList.add("open");
      } catch (error) {
        console.error(error);
      }
    }

    locationInput.addEventListener("input", () => {
      const typedValue = locationInput.value.trim();

      if (!typedValue) {
        suggestionsList.classList.remove("open");
        suggestionsList.replaceChildren();
        return;
      }

      openPanel("location");
    });

    locationInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        closePanels();
      }
    });

    dateSegment.addEventListener("click", (event) => {
      event.preventDefault();
      openPanel("date");
    });

    guestsSegment.addEventListener("click", (event) => {
      event.preventDefault();
      openPanel("guests");
    });

    checkInInput.addEventListener("change", updateDateSummary);
    checkOutInput.addEventListener("change", updateDateSummary);

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!isValidDateRange()) {
        dateSegment.classList.add("open");
        checkInInput.focus();
        return;
      }

      const hasMinorsOrPets =
        guestCounts.children > 0 ||
        guestCounts.infants > 0 ||
        guestCounts.pets > 0;
      if (hasMinorsOrPets && guestCounts.adults === 0) {
        setGuestError(
          "At least one adult must accompany children, infants, or pets.",
        );
        openPanel("guests");
        return;
      }

      const params = new URLSearchParams();

      const locationValueText = locationInput.value.trim();
      if (locationValueText) {
        params.set("location", locationValueText);
      }
      if (checkInInput.value) {
        params.set("checkIn", checkInInput.value);
      }
      if (checkOutInput.value) {
        params.set("checkOut", checkOutInput.value);
      }

      const totalGuests = guestCounts.adults + guestCounts.children;
      if (totalGuests > 0) {
        params.set("guests", String(totalGuests));
      }
      if (guestCounts.adults > 0) {
        params.set("adults", String(guestCounts.adults));
      }
      if (guestCounts.children > 0) {
        params.set("children", String(guestCounts.children));
      }
      if (guestCounts.infants > 0) {
        params.set("infants", String(guestCounts.infants));
      }
      if (guestCounts.pets > 0) {
        params.set("pets", String(guestCounts.pets));
      }

      window.location.assign(
        `/search-results.html${params.toString() ? `?${params.toString()}` : ""}`,
      );
    });

    document.addEventListener("click", (event) => {
      const clickedInsidePicker =
        event.target.closest(".search-dropdown") ||
        event.target.closest(".search-segment");
      if (!clickedInsidePicker) {
        closePanels();
      }
    });

    searchForm.append(
      locationSegment,
      createElement("div", { className: "divider" }),
      dateSegment,
      createElement("div", { className: "divider" }),
      guestsSegment,
      searchBtn,
      suggestionsList,
      datePanel,
      guestsPanel,
    );
    header.appendChild(searchForm);
  }

  const rightActions = createElement("div", { className: "nav-actions" });

  let toggleModeText = "Become a host";
  let toggleModeHref = "/host/create-listing.html";

  if (userMode === "host") {
    toggleModeText = "Switch to traveling";
    toggleModeHref = "/";
  } else if (userMode === "tenant" && isRegisteredHost) {
    toggleModeText = "Switch to hosting";
    toggleModeHref = "/host/today.html";
  }

  const toggleModeLink = createElement("a", {
    href: toggleModeHref,
    className: "link-property",
    textContent: toggleModeText,
  });

  const profileButton = createElement(
    "button",
    {
      className: "profile-menu",
      type: "button",
    },
    [
      createElement("img", {
        src: "../../../assets/icons/menu.svg",
        alt: "Menu",
        className: "hamburger",
      }),
      createElement("img", {
        src: profilePic,
        alt: "Profile",
        className: "avatar",
      }),
    ],
  );

  const dropdownMenu = createElement("div", { className: "profile-dropdown" }, [
    createElement("a", {
      href: "/messages",
      className: "dropdown-item",
      textContent: "Messages",
    }),
    createElement("a", {
      href: "/profile",
      className: "dropdown-item",
      textContent: "Profile",
    }),
  
    createElement("a", {
      href: "/logout",
      className: "dropdown-item",
      textContent: "Logout",
    }),
  ]);

  const profileDropdown = createElement(
    "div",
    { className: "profile-dropdown-container" },
    [profileButton, dropdownMenu],
  );

  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdownMenu.classList.remove("show");
  });

  if (userMode === "guest") {
    const loginButton = createElement("button", {
      type: "button",
      className: "btn btn-login",
      textContent: "Log In"
    });
  
    loginButton.addEventListener("click", () => {
      document.body.appendChild(createLoginModal());
    });
  
    const signupButton = createElement("button", {
      type: "button",
      className: "btn btn-signup",
      textContent: "Sign Up"
    });
  
    signupButton.addEventListener("click", () => {
      document.body.appendChild(createSignupModal());
    });
  
    rightActions.append(
      loginButton,
      signupButton
    );
  } else if (userMode === "tenant") {
    const favoritesLink = createElement(
      "a",
      { href: "/favorites", className: "favorites-link" },
      [
        createElement("img", {
          src: "../../../assets/icons/heart.svg",
          alt: "Favorites",
        }),
        document.createTextNode(" Favorites"),
      ],
    );
    rightActions.append(toggleModeLink, favoritesLink, profileDropdown);
  } else if (userMode === "host") {
    rightActions.append(toggleModeLink, profileDropdown);
  }

  header.appendChild(rightActions);

  return header;
}
