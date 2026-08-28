import { createElement, createModal } from "../reusable/functions.js";
import { createGuestPicker } from "./guestPicker.js";
import { createDatePicker } from "./datePicker.js";

export function createBookingPropertySummary(property, bookingDetails, bookings=[], blockings=[]) {

    const disabledRanges = [...bookings, ...blockings].map(range => {
        const endDate = new Date(`${range.end_date.split("T")[0]}T00:00:00`);

        return {
            from: range.start_date.split("T")[0],
            to: endDate.toISOString().split("T")[0]
        };
    });

    const propertySummaryContainer = createElement("div", {
        className: "property-summary-container"
    });

    const propertyTopContainer = createElement("div", {
        className: "property-top-container"
    });

    const propertyImage = createElement("img", {
        className: "property-booking-image",
        src: bookingDetails.thumbnail || "/assets/placeholders/default_home.jpg",
        alt: property.title
    });

    const propertyInfoContainer = createElement("div", {
        className: "property-info-container"
    });

    const propertyTitle = createElement("h3", {
        className: "property-booking-title",
        textContent: property.title
    });

    const propertyRating = createElement("p", {
        className: "property-booking-rating",
        textContent: `★ ${property.rating} (${property.review_count})`
    });

    propertyInfoContainer.append(
        propertyTitle,
        propertyRating
    );

    propertyTopContainer.append(
        propertyImage,
        propertyInfoContainer
    );


    const cancellationContainer = createElement("div", {
        className: "property-booking-section"
    });

    const cancellationTitle = createElement("h4", {
        className: "property-booking-section-title",
        textContent: "Free cancellation"
    });

    const cancellationText = createElement("p", {
        className: "property-booking-section-text",
        textContent: "Cancel within 24 hours for a full refund."
    });

    cancellationContainer.append(
        cancellationTitle,
        cancellationText
    );


    const datesContainer = createElement("div", {
        className: "property-booking-section property-booking-row"
    });

    const datesTextContainer = createElement("div", {
        className: "property-booking-row-text"
    });

    const datesTitle = createElement("h4", {
        className: "property-booking-section-title",
        textContent: "Dates"
    });

    const datesText = createElement("p", {
        className: "property-booking-section-text",
        textContent: `${bookingDetails.checkIn} – ${bookingDetails.checkOut}`
    });

    const datesChangeButton = createElement("button", {
        className: "property-change-button",
        type: "button",
        textContent: "Change"
    });

    datesChangeButton.addEventListener("click", () => {
        const datePicker = createDatePicker(
            bookingDetails.checkIn,
            bookingDetails.checkOut,
            null,
            disabledRanges
        );

        const saveButton = createElement("button", {
            type: "button",
            textContent: "Save",
            className: "date-save-button"
        });

        const content = createElement("div", {}, [
            datePicker.element,
            saveButton
        ]);

        const modal = createModal(
            "Change dates",
            content
        );

        saveButton.addEventListener("click", () => {
            const newCheckIn = datePicker.checkIn.value;
            const newCheckOut = datePicker.checkOut.value;

            if (!newCheckIn || !newCheckOut) {
                return;
            }

            if (newCheckIn >= newCheckOut) {
                return;
            }

            const params = new URLSearchParams(window.location.search);

            params.set("checkIn", newCheckIn);
            params.set("checkOut", newCheckOut);

            window.location.search = params.toString();
        });

        document.body.append(modal);
    });

    datesTextContainer.append(
        datesTitle,
        datesText
    );

    datesContainer.append(
        datesTextContainer,
        datesChangeButton
    );


    const guestsContainer = createElement("div", {
        className: "property-booking-section property-booking-row"
    });

    const guestsTextContainer = createElement("div", {
        className: "property-booking-row-text"
    });

    const guestsTitle = createElement("h4", {
        className: "property-booking-section-title",
        textContent: "Guests"
    });

    const guestTextParts = [];

    console.log(bookingDetails.guestCounts);

    for (const [type, count] of Object.entries(bookingDetails.guestCounts)) {
        if (count == 1) {
            guestTextParts.push(`${count} ${type.slice(0, -1)}`);
        } else if (count > 1) {
            guestTextParts.push(`${count} ${type}`);
        }
    }

    const guestText = guestTextParts.join(", ");

    const guestsText = createElement("p", {
        className: "property-booking-section-text",
        textContent: guestText
    });

    const guestsChangeButton = createElement("button", {
        className: "property-change-button",
        type: "button",
        textContent: "Change"
    });

    guestsChangeButton.addEventListener("click", () => {
        const guestPicker = createGuestPicker(
            bookingDetails.guestCounts
        );

        const saveButton = createElement("button", {
            type: "button",
            textContent: "Save",
            className: "guest-save-button"
        });

        const guestsError = createElement("p", {
            className: "booking-error",
            textContent: ""
        });

        const content = createElement("div", {}, [
            guestPicker.element,
            guestsError,
            saveButton
        ]);

        const modal = createModal(
            "Change guests",
            content
        );

        saveButton.addEventListener("click", () => {

            const guests = guestPicker.guestCounts;

            const hasMinorsOrPets =
                guests.children > 0 ||
                guests.infants > 0 ||
                guests.pets > 0;

            if (guests.adults === 0) {
                if (hasMinorsOrPets) {
                    guestsError.textContent =
                        "At least one adult must accompany children, infants, or pets.";
                } else {
                    guestsError.textContent =
                        "Choose at least one adult guest.";
                }
                return;
            }

            guestsError.textContent = "";
            const params = new URLSearchParams(window.location.search);

            params.set("adults", guestPicker.guestCounts.adults);
            params.set("children", guestPicker.guestCounts.children);
            params.set("infants", guestPicker.guestCounts.infants);
            params.set("pets", guestPicker.guestCounts.pets);

            window.location.search = params.toString();
        });

        document.body.append(modal);
    });

    guestsTextContainer.append(
        guestsTitle,
        guestsText
    );

    guestsContainer.append(
        guestsTextContainer,
        guestsChangeButton
    );


    const priceDetailsContainer = createElement("div", {
        className: "property-booking-section"
    });

    const priceDetailsTitle = createElement("h4", {
        className: "property-booking-section-title",
        textContent: "Price details"
    });

    const nightlyPriceRow = createElement("div", {
        className: "property-price-row"
    });

    const nightlyPriceText = createElement("span", {
        textContent: `${bookingDetails.nights} nights × $${property.price_per_night}`
    });

    const nightlyPriceAmount = createElement("span", {
        textContent: `$${bookingDetails.subtotal.toFixed(2)}`
    });

    nightlyPriceRow.append(
        nightlyPriceText,
        nightlyPriceAmount
    );


    const taxPriceRow = createElement("div", {
        className: "property-price-row"
    });

    const taxPriceText = createElement("span", {
        textContent: `Taxes (${bookingDetails.taxRate * 100}%)`
    });

    const taxPriceAmount = createElement("span", {
        textContent: `$${bookingDetails.taxes.toFixed(2)}`
    });

    taxPriceRow.append(
        taxPriceText,
        taxPriceAmount
    );

    priceDetailsContainer.append(
        priceDetailsTitle,
        nightlyPriceRow,
        taxPriceRow
    );


    const totalContainer = createElement("div", {
        className: "property-total-container"
    });

    const totalText = createElement("strong", {
        textContent: "Total USD"
    });

    const totalAmount = createElement("strong", {
        textContent: `$${bookingDetails.total.toFixed(2)}`
    });

    totalContainer.append(
        totalText,
        totalAmount
    );


    propertySummaryContainer.append(
        propertyTopContainer,
        cancellationContainer,
        datesContainer,
        guestsContainer,
        priceDetailsContainer,
        totalContainer
    );

    return propertySummaryContainer;
}