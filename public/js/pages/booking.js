import { createElement } from "../reusable/functions.js";
import { createBookingHeader } from "../components/bookingHeader.js";
import { createConfirmationSection } from "../components/confirmationSection.js";
import { createBookingPropertySummary } from "../components/bookingPropertySummary.js";

import { loadPropertyById, loadPropertyImages } from "../services/propertyService.js"

const bookingHeader = document.getElementById("booking-header");
const bookingBody = document.getElementById("booking-body");

const params = new URLSearchParams(window.location.search);

const checkIn = params.get("checkIn");
const checkOut = params.get("checkOut");

const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

const guestCounts = {
    adults: Number(params.get("adults")) || 0,
    children: Number(params.get("children")) || 0,
    infants: Number(params.get("infants")) || 0,
    pets: Number(params.get("pets")) || 0
};

const propertyId = window.location.pathname.split("/")[2];
const property = await loadPropertyById(`/api/properties/${propertyId}`);
const propertyImages = await loadPropertyImages(`/api/properties/${propertyId}/images`);

const thumbnail = propertyImages[0]?.image_url || null;
const subtotal = nights * property.price_per_night;
const taxRate = 0.08; // Using a fixed tax rate PA 
const taxes = taxRate * subtotal;
const total = subtotal + taxes;

const bookingDetails = {
    thumbnail,
    checkIn,
    checkOut,
    guestCounts,
    nights,
    subtotal,
    taxes,
    taxRate,
    total
};

const header = createBookingHeader();

bookingHeader.append(header);

const leftContainer = createElement("div", {
    className: "left-container"
});

const confirmationSection = createConfirmationSection(
    bookingDetails
);

const propertyContainer = createElement("div", {
    className: "property-container"
});

const propertySummary = createBookingPropertySummary(
    property,
    bookingDetails
);

propertyContainer.append(
    propertySummary
);

const blankContainer = createElement("div", {
    className: "blank-container"
});


bookingBody.append(
    leftContainer,
    confirmationSection,
    propertyContainer,
    blankContainer
);