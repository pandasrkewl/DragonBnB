import { loadPropertyById } from "../services/propertyService.js"

const params = new URLSearchParams(window.location.search);
const listingId = params.get("id");

loadPropertyById(`/api/properties/${listingId}`);