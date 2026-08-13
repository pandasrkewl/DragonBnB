import { createElement, createModal } from "../reusable/functions.js";
import { createReviewCard } from "./reviewCard.js";

export function createPropertyReviews(property, reviews) {
    const container = createElement("div", {
        className: "property-reviews"
    });

    const title = createElement("h2", {
        className: "reviews-title",
        textContent: `★ ${property.rating} · ${property.review_count} reviews`
    });

    const preview = createElement("div", {
        className: "reviews-preview"
    });

    reviews.slice(0, 4).forEach((review) => {
        const card = createReviewCard(review);
        preview.append(card);
    });

    container.append(
        title,
        preview
    );

    if (reviews.length > 0) {
        const showAllButton = createElement("button", {
            className: "show-all-reviews-btn",
            textContent: `Show all ${reviews.length} reviews`
        });

        showAllButton.addEventListener("click", () => {
            const fullReviews = createElement("div", {
                className: "full-reviews"
            });

            reviews.forEach((review) => {
                const card = createReviewCard(review);
                fullReviews.append(card);
            });

            const modal = createModal(
                `★ ${property.rating} · ${property.review_count} reviews`,
                fullReviews
            );

            document.body.append(modal);
        });

        container.append(showAllButton);
    }

    return container;
}