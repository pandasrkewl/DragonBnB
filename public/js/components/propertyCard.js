import { createElement } from "../reusable/functions.js";

async function toggleFavorite(property, button) {
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
    button.textContent = result.isFavorited ? "♥" : "♡";
    button.setAttribute("aria-label", result.isFavorited ? "Remove from wishlist" : "Add to wishlist");
    button.classList.toggle("is-favorited", result.isFavorited);
}

export function createPropertyCard(property, onFavoriteChanged = null) {
    
    const column = createElement("div", {className: "column"});

    const imageContainer = createElement("div", {className: "image-container"});
    const image = createElement("img", {
        src: property.image_url || "/assets/placeholders/default_home.jpg",
        alt: property.title,
        className: "property" 
    });
    const favoriteButton = createElement("button", {
        className: property.is_favorited ? "favorite-btn is-favorited" : "favorite-btn",
        textContent: property.is_favorited ? "♥" : "♡",
        type: "button",
        "aria-label": property.is_favorited ? "Remove from wishlist" : "Add to wishlist"
    });

    const name = createElement("p", {className: "name", textContent: `${property.property_type} in ${property.city}`});
    const subName = createElement("p", {className: "title", textContent: `${property.title}`});
    const description = createElement("p", {className: "description", textContent: `$${property.price_per_night} per night · ★ ${property.rating}`})
  
    imageContainer.append(image, favoriteButton);
    column.append(imageContainer, name, subName, description);

    favoriteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleFavorite(property, favoriteButton)
            .then(() => onFavoriteChanged?.(property.is_favorited, column))
            .catch(console.error);
    });

    column.addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        params.set("id", property.id);
        window.location.href = `/listing?${params.toString()}`;
    });
    
    return column;
}
