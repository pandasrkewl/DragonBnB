import { createElement, createModal } from "../reusable/functions.js";

export function createAmenitiesSection(amenities) {

    const categories = {
        basics: "Basics",
        bathroom: "Bathroom",
        bedroom_and_laundry: "Bedroom and laundry",
        entertainment: "Entertainment",
        family: "Family",
        heating_and_cooling: "Heating and cooling",
        home_safety: "Home safety",
        internet_and_office: "Internet and office",
        kitchen_and_dining: "Kitchen and dining",
        location_features: "Location features",
        outdoor: "Outdoor",
        parking_and_facilities: "Parking and facilities",
        services: "Services"
    };

    const container = createElement("div", {
        className: "amenities-section"
    });

    const title = createElement("h2", {
        textContent: "What this place offers"
    });

    const preview = createElement("div", {
        className: "amenities-preview"
    });

    amenities.slice(0, 6).forEach((amenity) => {
        const item = createElement("p", {
            className: "amenity-item",
            textContent: amenity.name
        })

        preview.append(item);
    })

    const showAllButton = createElement("button", {
        className: "show-all-amenities-btn",
        textContent: `Show all ${amenities.length} amenities`
    })

    showAllButton.addEventListener("click", () => {
        const fullAmenities = createElement("div", {
            className: "full-amenities"
        });

        for (const [categoryKey, categoryName] of Object.entries(categories)) {

            const categoryAmenities = amenities.filter((amenity) => {
                return amenity[categoryKey];
            });

            if (categoryAmenities.length === 0) {
                continue;
            }

            const categorySection = createElement("div", {
                className: "amenity-category"
            });

            const categoryTitle = createElement("h3", {
                className: "amenity-category-title",
                textContent: categoryName
            });

            categorySection.append(categoryTitle);

            categoryAmenities.forEach((amenity) => {
                const item = createElement("p", {
                    className: "amenity-item",
                    textContent: amenity.name
                });

                categorySection.append(item);
            });

            fullAmenities.append(categorySection);
        }

        const modal = createModal(
            "What this place offers",
            fullAmenities
        );

        document.body.append(modal);
    });

    container.append(
        title,
        preview,
        showAllButton
    );

    return container;

}