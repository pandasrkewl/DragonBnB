import { createPropertyCard } from "../components/propertyCard.js";

export function loadProperties(url, railId) {

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load properties");
      }
      return response.json();
    })

    .then((properties) => {
      const rail = document.getElementById(railId);
      properties.forEach((property) => {
        const card = createPropertyCard(property);
        rail.appendChild(card);
      });
    })

    .catch((error) => {
      console.error(error);
    });
};

export function loadPropertyById(url) {
 fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load property");
      }
      return response.json();
    })
    .then((property) => {
      console.log(property);
    })
    .catch((error) => {
      console.error(error);
    });
};

export function loadPropertyImages(url) {
   fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load images");
      }
      return response.json();
    })
    .then((images) => {
      console.log(images);
    })
    .catch((error) => {
      console.error(error);
    });
}

export function loadPropertyAmenities(url) {
   fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load amenities");
      }
      return response.json();
    })
    .then((amenities) => {
      console.log(amenities);
    })
    .catch((error) => {
      console.error(error);
    });
}

export function loadPropertyReviews(url) {
   fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load reviews");
      }
      return response.json();
    })
    .then((reviews) => {
      console.log(reviews);
    })
    .catch((error) => {
      console.error(error);
    });
}