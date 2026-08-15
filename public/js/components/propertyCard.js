import { createElement } from "../reusable/functions.js";

export function createPropertyCard(property) {
    
    const column = createElement("div", {className: "column"});

    const imageContainer = createElement("div", {className: "image-container"});
    const image = createElement("img", {
        src: property.image_url || "/assets/placeholders/default_home.jpg",
        alt: property.title,
        className: "property" 
    });
    const favoriteButton = createElement("button", {className:"favorite-btn", textContent: "♡", "aria-label": "Add to wishlist"});

    const name = createElement("p", {className: "name", textContent: `${property.property_type} in ${property.city}`});
    const subName = createElement("p", {className: "title", textContent: `${property.title}`});
    const description = createElement("p", {className: "description", textContent: `$${property.price_per_night} per night · ★ ${property.rating}`})
  
    imageContainer.append(image, favoriteButton);
    column.append(imageContainer, name, subName, description);

    column.addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        params.set("id", property.id);
        window.location.href = `/listing?${params.toString()}`;    
    });
    
    return column;
}
