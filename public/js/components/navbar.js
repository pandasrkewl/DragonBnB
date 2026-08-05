function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (key === "className") {
      el.className = value;
    } else if (key === "textContent") {
      el.textContent = value;
    } else {
      el.setAttribute(key, value);
    }
  }

  children.forEach((child) => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  });

  return el;
}

export function createNavbar({
  userMode = "guest",
  isRegisteredHost = false, // NEW: Does the user have properties?
  activeHostTab = null, // NEW: Index of the active tab (0, 1, 2, 3)
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

  // --- Center Section ---
  if (userMode === "host") {
    // Array of host tabs for easy indexing
    const hostTabs = [
      { text: "Today", href: "/host/today" },
      { text: "Calendar", href: "/host/calendar" },
      { text: "Listings", href: "/host/listings" },
      { text: "Messages", href: "/host/messages" },
    ];

    const hostNavLinks = hostTabs.map((tab, index) => {
      // If the index matches the passed active tab, give it the 'active' class
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
    // Search Bar Logic Remains the Same
    const searchBar = createElement("div", { className: "search-bar" });

    const whereSegment = createElement("div", { className: "search-segment" }, [
      createElement("img", {
        src: "../../../assets/icons/location.svg",
        alt: "Location",
        className: "segment-icon",
      }),
      createElement("div", { className: "segment-text" }, [
        createElement("span", { className: "label", textContent: "Where" }),
        createElement("input", {
          type: "text",
          placeholder: "Search location",
        }),
      ]),
    ]);

    const whenSegment = createElement("div", { className: "search-segment" }, [
      createElement("img", {
        src: "../../../assets/icons/calendar.svg",
        alt: "Calendar",
        className: "segment-icon",
      }),
      createElement("div", { className: "segment-text" }, [
        createElement("span", { className: "label", textContent: "When" }),
        createElement("input", { type: "text", placeholder: "Add dates" }),
      ]),
    ]);

    const guestsSegment = createElement(
      "div",
      { className: "search-segment" },
      [
        createElement("img", {
          src: "../../../assets/icons/person.svg",
          alt: "Guests",
          className: "segment-icon",
        }),
        createElement("div", { className: "segment-text" }, [
          createElement("span", { className: "label", textContent: "Guests" }),
          createElement("input", { type: "text", placeholder: "Add guests" }),
        ]),
      ],
    );

    const searchBtn = createElement("button", { className: "search-btn" }, [
      createElement("img", {
        src: "../../../assets/icons/search.svg",
        alt: "Search",
      }),
    ]);

    searchBar.append(
      whereSegment,
      createElement("div", { className: "divider" }),
      whenSegment,
      createElement("div", { className: "divider" }),
      guestsSegment,
      searchBtn,
    );
    header.appendChild(searchBar);
  }

  // --- Right Actions Section ---
  const rightActions = createElement("div", { className: "nav-actions" });

  // 1. Determine dynamic Host/Tenant text and link
  let toggleModeText = "Become a host";
  let toggleModeHref = "/host/become";

  if (userMode === "host") {
    toggleModeText = "Switch to traveling";
    toggleModeHref = "/"; // Send them back to the main search page
  } else if (userMode === "tenant" && isRegisteredHost) {
    toggleModeText = "Switch to hosting";
    toggleModeHref = "/host/today"; // Send them to host dashboard
  }

  const toggleModeLink = createElement("a", {
    href: toggleModeHref,
    className: "link-property",
    textContent: toggleModeText,
  });

  // 2. Profile Dropdown (Shared between Tenant and Host)
  const profileDropdown = createElement(
    "button",
    { className: "profile-menu" },
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

  // 3. Assemble Right Actions based on Mode
  if (userMode === "guest") {
    rightActions.append(
      toggleModeLink,
      createElement("a", {
        href: "/login.html",
        className: "btn btn-login",
        textContent: "Log In",
      }),
      createElement("a", {
        href: "/signup.html",
        className: "btn btn-signup",
        textContent: "Sign Up",
      }),
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
