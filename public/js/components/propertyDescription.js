import { createElement, createModal } from '../reusable/functions.js';

export function createPropertyDescription(property) {
    const container = createElement('div', {
        className: 'property-description-section',
    });

    const description = createElement('p', {
        className: 'property-description-text',
        textContent: property.description,
    });

    const showMoreButton = createElement('button', {
        className: 'show-more-btn',
        textContent: 'Show more',
    });

    showMoreButton.addEventListener('click', () => {
        const fullDescription = createElement('p', {
            className: 'full-description-text',
            textContent: property.description,
        });

        const modal = createModal('About this place', fullDescription);

        document.body.append(modal);
    });

    container.append(description, showMoreButton);

    return container;
}
