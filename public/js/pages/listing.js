import { createNavbar } from "../components/navbar.js";
import { createPropertyListingTop } from "../components/propertyListingTop.js";
import { loadPropertyById, loadPropertyImages, loadPropertyAmenities, loadPropertyReviews } from "../services/propertyService.js"

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

const navBarContainer = document.getElementById("navbar-container");
const topContainer = document.getElementById("top-container");
const leftBodyContainer = document.getElementById("left-body-container");
const rightBodyContainer = document.getElementById("right-body-container");

const navElement = createNavbar({
  userMode: "guest",
});

navBarContainer.appendChild(navElement);

if (!listingId) {
    console.error("Missing property id");
}

const property = await loadPropertyById(`/api/properties/${listingId}`);
const images = await loadPropertyImages(`/api/properties/${listingId}/images`);
const amenities = await loadPropertyAmenities(`/api/properties/${listingId}/amenities`);
const reviews = await loadPropertyReviews(`/api/properties/${listingId}/reviews`);

const top = createPropertyListingTop(property, images);

topContainer.append(top);

