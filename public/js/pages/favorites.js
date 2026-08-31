import { createNavbar } from "../components/navbar.js";
import { createPropertyCard } from "../components/propertyCard.js";
import { createElement } from "../reusable/functions.js";

const navBarContainer = document.getElementById("navbar-container");
const header = document.getElementById("favorites-header");
const grid = document.getElementById("favorites-grid");

async function validateAccount() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      throw new Error("Account validation failed");
    }

    const user = await response.json();
    if (!user) {
      window.location.replace("/");
      return null;
    }

    return user;
  } catch (err) {
    console.error("Failed to validate account:", err);
    window.location.replace("/");
    return null;
  }
}

const user = await validateAccount();

if (!user) {
  throw new Error("User is not authenticated");
}

navBarContainer.appendChild(
  createNavbar({
    userMode: "tenant",
    isRegisteredHost: user?.host ?? false,
    user: user,
  }),
);

header.replaceChildren(
  createElement("h1", { textContent: "Your favorites" }),
  createElement("p", { textContent: "A collection of places you would like to remember." }),
);

try {
  const response = await fetch("/api/wishlist");
  if (!response.ok) {
    throw new Error("Could not load favorites");
  }

  const properties = await response.json();
  if (properties.length === 0) {
    grid.replaceChildren(
      createElement("div", {
        className: "empty-state",
        textContent: "You have not saved any stays yet.",
      }),
    );
  } else {
    properties.forEach((property) => {
      property.is_favorited = true;
      grid.appendChild(
        createPropertyCard(property, (isFavorited, card) => {
          if (!isFavorited) {
            card.remove();
          }
        }),
      );
    });
  }
} catch (error) {
  console.error(error);
  grid.replaceChildren(
    createElement("div", {
      className: "empty-state",
      textContent: "We could not load your favorites right now.",
    }),
  );
}
