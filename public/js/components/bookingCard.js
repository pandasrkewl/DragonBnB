import { createElement } from '../reusable/functions.js';

export function createBookingCard(property) {
    const card = createElement('div', {
        className: 'booking-card',
    });

    const priceSection = createElement('div', {
        className: 'booking-price-section',
    });

    const price = createElement('span', {
        className: 'booking-price',
        textContent: `$${property.price_per_night}`,
    });

    const priceText = createElement('span', {
        className: 'booking-price-text',
        textContent: ' per night',
    });

    priceSection.append(price, priceText);

    const dateSection = createElement('div', {
        className: 'booking-date-section',
    });

    const checkInBox = createElement('div', {
        className: 'booking-date-box',
    });

    const checkInLabel = createElement('label', {
        className: 'booking-label',
        textContent: 'CHECK-IN',
    });

    const checkInInput = createElement('input', {
        className: 'booking-date-input',
        type: 'date',
    });

    checkInBox.append(checkInLabel, checkInInput);

    const checkOutBox = createElement('div', {
        className: 'booking-date-box',
    });

    const checkOutLabel = createElement('label', {
        className: 'booking-label',
        textContent: 'CHECKOUT',
    });

    const checkOutInput = createElement('input', {
        className: 'booking-date-input',
        type: 'date',
    });

    checkOutBox.append(checkOutLabel, checkOutInput);

    dateSection.append(checkInBox, checkOutBox);

    const guestSection = createElement('div', {
        className: 'booking-guests',
    });

    const guestLabel = createElement('label', {
        className: 'booking-label',
        textContent: 'GUESTS',
    });

    const guestInput = createElement('input', {
        className: 'booking-guest-input',
        type: 'number',
        min: '1',
        max: property.max_guests,
        value: '1',
    });

    guestSection.append(guestLabel, guestInput);

    const reserveButton = createElement('button', {
        className: 'reserve-btn',
        textContent: 'Reserve',
    });

    const chargeText = createElement('p', {
        className: 'booking-charge-text',
        textContent: "You won't be charged yet",
    });

    card.append(
        priceSection,
        dateSection,
        guestSection,
        reserveButton,
        chargeText
    );

    return card;
}
