// Includes image gallery, title, and favorite button

import { createElement } from "../reusable/functions.js";
import { createPropertyGallery } from "./propertyGallery.js";

export function createPropertyListingTop(property, images) {
    const top_container = createElement("div", {
        className: "property-listing-top"
    });

    const header = createElement("div", {
        className: "property-listing-header"
    });

    const title = createElement("h1", {
        className: "property-listing-title",
        textContent: property.title
    });

    const favoriteSection = createElement("div", {
        className: "listing-favorite"
    }); 

    const favoriteButton = createElement("button", {
        className: property.is_favorited ? "listing-favorite-btn is-favorited" : "listing-favorite-btn",
        textContent: property.is_favorited ? "♥" : "♡",
        type: "button",
        "aria-label": property.is_favorited ? "Remove from wishlist" : "Add to wishlist"
    }); 

    const gallery = createPropertyGallery(images);

    favoriteSection.append(favoriteButton);
    gallery.appendChild(favoriteSection);

    favoriteButton.addEventListener("click", async () => {
        const response = await fetch(`/api/wishlist/${property.id}`, { method: "POST" });
        if (response.status === 401) {
            window.alert("Please log in to save favorites.");
            return;
        }
        if (!response.ok) {
            throw new Error("Could not update favorite");
        }
        const result = await response.json();
        property.is_favorited = result.isFavorited;
        favoriteButton.textContent = result.isFavorited ? "♥" : "♡";
        favoriteButton.classList.toggle("is-favorited", result.isFavorited);
        favoriteButton.setAttribute("aria-label", result.isFavorited ? "Remove from wishlist" : "Add to wishlist");
    });

    header.append(title);

    top_container.append(header, gallery);

    return top_container;
} 