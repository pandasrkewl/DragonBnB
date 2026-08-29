import { createPropertyCard } from "../components/propertyCard.js";

export function loadProperties(url, railId) {

  return fetch(url)
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
 return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load property");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
};

export function loadPropertyImages(url) {
   return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load images");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}

export function loadPropertyAmenities(url) {
   return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load amenities");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}

export function loadPropertyReviews(url) {
   return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load reviews");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}

export function loadPropertyBookings(url) {
   return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load bookings");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}

export function loadPropertyBlockings(url) {
   return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load blockings");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error);
      return [];
    });
}