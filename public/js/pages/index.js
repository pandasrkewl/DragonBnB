import { createNavbar } from "../components/navbar.js";

async function loadNavbar() {
  try {
    const response = await fetch("/api/me");
    const user = await response.json();

    let userMode = "guest";

    if (user) {
      userMode = user.host ? "host" : "tenant";
    }

    const navElement = createNavbar({
      userMode,
      isRegisteredHost: user?.host ?? false,
    });

    document
      .getElementById("navbar-container")
      .appendChild(navElement);

  } catch (err) {
    console.error(err);

    const navElement = createNavbar({
      userMode: "guest",
    });

    document
      .getElementById("navbar-container")
      .appendChild(navElement);
  }
}

loadNavbar();