import { createElement } from '../reusable/functions.js';

export function createPropertySummary(property) {
    const summaryContainer = createElement('div', {
        className: 'property-summary',
    });
    const title = createElement('h2', {
        className: 'property-summary-title',
        textContent: `${property.property_type} in ${property.city}, ${property.state}`,
    });
    const details = createElement('p', {
        className: 'property-summary-details',
        textContent: `${property.max_guests} guests · ${property.bedrooms} bedrooms · ${property.beds} beds · ${property.bathrooms} baths`,
    });
    const rating = createElement('p', {
        className: 'property-summary-rating',
        textContent: `★ ${property.rating} · ${property.review_count} reviews`,
    });
    summaryContainer.append(title, details, rating);

    return summaryContainer;
}
