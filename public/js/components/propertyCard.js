import { createElement } from "../reusable/functions.js";

export function createPropertyCard(property) {
    const cardLink = createElement("a", {
        href: `/listing?id=${property.id}`,
        className: "property-card-link",
    });
    
    const column = createElement("div", {className: "column"});

    const imageContainer = createElement("div", {className: "image-container"});
    const image = createElement("img", {
        src: property.image_url || "/assets/placeholders/default_home.jpg",
        alt: property.title,
        className: "property" 
    });
    const favoriteButton = createElement("button", {className:"favorite-btn", textContent: "♡", "aria-label": "Add to wishlist"});

    const name = createElement("p", {className: "name", textContent: `${property.property_type} in ${property.city}`})
    const description = createElement("p", {className: "description", textContent: `$${property.price_per_night} per night · ★ ${property.rating}`})
  
    imageContainer.append(image, favoriteButton);
    column.append(imageContainer, name, description);

    column.addEventListener("click", () => {
        window.location.href =  `/listing?id=${property.id}`;
    });
    
    return column;
}
