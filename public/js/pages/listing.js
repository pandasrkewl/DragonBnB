import { createNavbar } from "../components/navbar.js";
import { createPropertyListingTop } from "../components/propertyListingTop.js";
import { createPropertySummary } from "../components/propertySummary.js";
import { createHostSection } from "../components/hostSection.js";
import { createPropertyDescription } from "../components/propertyDescription.js";
import { createAmenitiesSection } from "../components/propertyAmenities.js";
import { createPropertyReviews } from "../components/propertyReviews.js";
import { createBookingCard } from "../components/bookingCard.js";

import { loadPropertyById, loadPropertyImages, loadPropertyAmenities, loadPropertyReviews, loadPropertyBookings, loadPropertyBlockings } from "../services/propertyService.js"


const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");
const checkIn = params.get("checkIn");
const checkOut = params.get("checkOut");
const guestCounts = {
    adults: Number(params.get("adults")) || 0,
    children: Number(params.get("children")) || 0,
    infants: Number(params.get("infants")) || 0,
    pets: Number(params.get("pets")) || 0
};

const navBarContainer = document.getElementById("navbar-container");
const topContainer = document.getElementById("top-container");
const leftBodyContainer = document.getElementById("left-body-container");
const rightBodyContainer = document.getElementById("right-body-container");

const response = await fetch("/api/me");
const user = await response.json();
const userMode = user ? "tenant" : "guest";

const navElement = createNavbar({
  userMode: userMode,
  activeHostTab: 2,
  isRegisteredHost: user?.host ?? false,
});

navBarContainer.appendChild(navElement);

if (!listingId) {
    console.error("Missing property id");
}

const property = await loadPropertyById(`/api/properties/${listingId}`);
const images = await loadPropertyImages(`/api/properties/${listingId}/images`);
const amenities = await loadPropertyAmenities(`/api/properties/${listingId}/amenities`);
const reviews = await loadPropertyReviews(`/api/properties/${listingId}/reviews`);
const bookings = await loadPropertyBookings(`/api/properties/${listingId}/bookings`)
const blockings = await loadPropertyBlockings(`/api/properties/${listingId}/blockings`);

const top = createPropertyListingTop(property, images);
const bodyLeftSummary = createPropertySummary(property);
const bodyLeftHost = createHostSection(property);
const bodyLeftDescription = createPropertyDescription(property);
const bodyLeftAmenities = createAmenitiesSection(amenities);
const reviewsSection = createPropertyReviews(property, reviews);
const bookingCard = createBookingCard(property, bookings, blockings, checkIn, checkOut, guestCounts);

topContainer.append(top);
leftBodyContainer.append(bodyLeftSummary, bodyLeftHost, bodyLeftDescription, bodyLeftAmenities, reviewsSection);
rightBodyContainer.append(bookingCard);

