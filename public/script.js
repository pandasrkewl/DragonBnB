function createPropertyCard(property) {
    const rail = document.createElement("div");
    rail.classList.add("rail")

    const column = document.createElement("div");
    column.classList.add("column");

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");

    const image = document.createElement("img");
    image.src = property.image_url || "/placeholders/default_home.jpg";
    image.alt = property.title;    
    image.classList.add("property");

    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("favorite-btn");
    favoriteButton.textContent = "♡";
    favoriteButton.setAttribute("aria-label", "Add to wishlist");

    const name = document.createElement("p");
    name.classList.add("name");
    name.textContent = property.title;

    const description = document.createElement("p");
    description.classList.add("description");
    description.textContent =
        `$${property.price_per_night} per night · ★ ${property.rating}`;

    imageContainer.appendChild(image);
    imageContainer.appendChild(favoriteButton);

    column.appendChild(imageContainer);
    column.appendChild(name);
    column.appendChild(description);

    return column;
}

function loadProperties(url, railId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load properties");
            }

            return response.json();
        })
        .then(properties => {
            const rail = document.getElementById(railId);

            properties.forEach(property => {
                const card = createPropertyCard(property);
                rail.appendChild(card);
            });
        })
        .catch(error => {
            console.error(error);
        });
}



loadProperties(
    "/api/properties?city=Philadelphia&sortBy=rating&limit=8",
    "popular-rail"
);

loadProperties(
    "/api/properties?city=Philadelphia&sortBy=price_low&limit=8",
    "affordable-rail"
);

loadProperties(
    "/api/properties?city=Atlantic%20City&sortBy=rating&limit=8",
    "atlantic-city-rail"
);