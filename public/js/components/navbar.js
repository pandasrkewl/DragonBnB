import {createElement} from "../reusable/functions.js"

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
      { text: "Today", href: "/host/today" },
      { text: "Calendar", href: "/host/calendar" },
      { text: "Listings", href: "/host/listings" },
      { text: "Messages", href: "/host/messages" },
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

  const rightActions = createElement("div", { className: "nav-actions" });

  let toggleModeText = "Become a host";
  let toggleModeHref = "/host/become";

  if (userMode === "host") {
    toggleModeText = "Switch to traveling";
    toggleModeHref = "/";
  } else if (userMode === "tenant" && isRegisteredHost) {
    toggleModeText = "Switch to hosting";
    toggleModeHref = "/host/today";
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
    ]
  );

  const dropdownMenu = createElement(
    "div",
    { className: "profile-dropdown" },
    [
      createElement("a", {
        href: "/logout",
        className: "dropdown-item",
        textContent: "Logout",
      }),
    ]
  );

  const profileDropdown = createElement(
    "div",
    { className: "profile-dropdown-container" },
    [profileButton, dropdownMenu]
  );

  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdownMenu.classList.remove("show");
  });

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
    rightActions.append(
      toggleModeLink,
      favoritesLink,
      profileDropdown,
    );
  
  } else if (userMode === "host") {
    rightActions.append(
      toggleModeLink,
      profileDropdown,
    );
  }

  header.appendChild(rightActions);

  return header;
}
