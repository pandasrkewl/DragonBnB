import { createElement } from "../reusable/functions.js";
import { createGuestPicker } from "./guestPicker.js";

export function createBookingCard(property, bookings, checkIn, checkOut, guestCounts) {

    const disabledRanges = bookings.map(booking => ({
        from: booking.start_date.split("T")[0],
        to: booking.end_date.split("T")[0]
    }))

    const card = createElement("form", {
        className: "booking-card"
    });

    const priceSection = createElement("div", {
        className: "booking-price-section"
    });

    const price = createElement("span", {
        className: "booking-price",
        textContent: `$${property.price_per_night}`
    });

    const priceText = createElement("span", {
        className: "booking-price-text",
        textContent: " per night"
    });

    priceSection.append(price, priceText);

    const dateSection = createElement("div", {
        className: "booking-date-section"
    });

    const checkInBox = createElement("div", {
        className: "booking-date-box"
    });

    checkInBox.addEventListener("click", () => {
        checkInInput.focus();
    })

    const checkInLabel = createElement("label", {
        className: "booking-label",
        textContent: "CHECK-IN"
    });

    const checkInInput = createElement("input", {
        className: "booking-date-input",
        type: "text",
        placeholder: "Check in",
        readOnly: true
    });

    checkInBox.append(
        checkInLabel,
        checkInInput
    );

    const checkOutBox = createElement("div", {
        className: "booking-date-box"
    });

    const checkOutLabel = createElement("label", {
        className: "booking-label",
        textContent: "CHECKOUT"
    });

    const checkOutInput = createElement("input", {
        className: "booking-date-input",
        type: "text",
        placeholder: "Check out",
        readOnly: true
    });

    checkOutBox.addEventListener("click", () => {
        checkOutInput.focus();
    })

    const checkOutCalendar = flatpickr(checkOutInput, {
        minDate: "today",
        disable: disabledRanges,
        defaultDate: checkOut
    });

    const checkInCalendar = flatpickr(checkInInput, {
        minDate: "today",
        disable: disabledRanges,
        defaultDate: checkIn,

        onChange: function(selectedDates) {
            const checkInDate = selectedDates[0];

            if (!checkInDate) {
                return;
            }

            checkOutCalendar.set("minDate", checkInDate);
            
            const nextBooking = bookings.map(booking => new Date(booking.start_date)).filter(startDate => startDate > checkInDate).sort((a,b) => a-b)[0];

            if (nextBooking) {
                checkOutCalendar.set("maxDate", nextBooking);
            } else {
                checkOutCalendar.set("maxDate", null);
            }

            checkOutCalendar.clear();
        }
    });

    checkOutBox.append(
        checkOutLabel,
        checkOutInput
    );

    dateSection.append(
        checkInBox,
        checkOutBox
    );

    const guestSection = createElement("div", {
        className: "booking-guests"
    });

    const guestLabel = createElement("label", {
        className: "booking-label",
        textContent: "GUESTS"
    });

    const guestPicker = createGuestPicker(guestCounts);

    const guestValue = createElement("div", {
        className: "booking-guest-value",
    });

    guestValue.addEventListener("click", () => {
        guestPicker.element.classList.toggle("open");
    });

    guestSection.append(
        guestLabel,
        guestValue,
        guestPicker.element
    );

    const reserveButton = createElement("button", {
        className: "reserve-btn",
        textContent: "Reserve",
        type: "submit"
    });

    function setError(errorText) {
        bookingError.textContent = errorText;
    }

    function isValidDateRange() {
        const checkInDate = checkInCalendar.selectedDates[0];
        const checkOutDate = checkOutCalendar.selectedDates[0];
        
        if (!checkInDate) {
            setError("Please input the Check In date");
            return false;
        } else if (!checkOutDate) {
            setError("Please input the Check Out date");
            return false;
        }
        else if (checkInInput.value > checkOutInput.value) {
            setError("Check-in must be on or before check-out.")
            return false;
        }
        return true;
    }

    function isValidGuests() {
        const allGuestCounts = guestPicker.guestCounts

        const hasMinorsOrPets = allGuestCounts.children > 0 || allGuestCounts.infants > 0 || allGuestCounts.pets > 0;
        if (allGuestCounts.adults === 0) {
            if (hasMinorsOrPets) {
                setError("At least one adult must accompany children, infants, or pets.");
                return false;
            } else {
                setError("Choose at least one adult guest.");
                return false;
            }
        } 
        return true;
    }

    

    card.addEventListener("submit", async (event) => {
        event.preventDefault();
        setError("");

        if (!isValidDateRange()) {
            return;
        }

        if (!isValidGuests()) {
            return;
        }

        window.location.href = `/listing/${property.id}/book`;
    })

    const bookingError = createElement("p", {
        className: "booking-error",
        textContent: ""
    });

    const chargeText = createElement("p", {
        className: "booking-charge-text",
        textContent: "You won't be charged yet"
    });

    card.append(
        priceSection,
        dateSection,
        guestSection,
        bookingError,
        reserveButton,
        chargeText
    );

    return card;
}