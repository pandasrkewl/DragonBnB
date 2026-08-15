// Includes image gallery, title, and favorite button

import { createElement } from '../reusable/functions.js';
import { createPropertyGallery } from './propertyGallery.js';

export function createPropertyListingTop(property, images) {
    const top_container = createElement('div', {
        className: 'property-listing-top',
    });

    const header = createElement('div', {
        className: 'property-listing-header',
    });

    const title = createElement('h1', {
        className: 'property-listing-title',
        textContent: property.title,
    });

    const favoriteSection = createElement('div', {
        className: 'listing-favorite',
    });

    const favoriteButton = createElement('p', {
        className: 'listing-favorite-btn',
        textContent: '♡',
        'aria-label': 'Add to wishlist',
    });

    const favoriteSectionText = createElement('p', {
        className: 'listing-favorite-text',
        textContent: 'Save',
    });

    const gallery = createPropertyGallery(images);

    favoriteSection.append(favoriteButton, favoriteSectionText);

    header.append(title, favoriteSection);

    top_container.append(header, gallery);

    return top_container;
}
