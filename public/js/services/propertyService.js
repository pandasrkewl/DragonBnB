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
}