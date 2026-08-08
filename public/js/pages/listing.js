import { loadPropertyById, loadPropertyImages, loadPropertyAmenities, loadPropertyReviews } from "../services/propertyService.js"

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

loadPropertyById(`/api/properties/${listingId}`);
loadPropertyImages(`/api/properties/${listingId}/images`);
loadPropertyAmenities(`/api/properties/${listingId}/amenities`);
loadPropertyReviews(`/api/properties/${listingId}/reviews`)
