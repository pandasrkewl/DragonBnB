import { createElement, createModal } from "../reusable/functions.js";

const DEFAULT_CENTER = [39.8283, -98.5795]; // roughly the center of the US
const DEFAULT_ZOOM = 4;

function openPropertyModal(property) {
  const image = createElement("img", {
    className: "pin-modal-image",
    src: property.image_url || "/assets/placeholders/default_home.jpg",
    alt: property.title,
  });

  const location = createElement("p", {
    className: "pin-modal-location",
    textContent: `${property.city}, ${property.state}`,
  });

  const rating = createElement("p", {
    className: "pin-modal-rating",
    textContent: `★ ${property.rating} · ${property.review_count} review${
      property.review_count === 1 ? "" : "s"
    }`,
  });

  const price = createElement("p", {
    className: "pin-modal-price",
    textContent: `$${property.price_per_night} per night`,
  });

  const link = createElement("a", {
    className: "pin-modal-link",
    href: `/listing?id=${property.id}`,
    textContent: "View listing →",
  });

  const body = createElement("div", { className: "pin-modal-body" }, [
    image,
    location,
    rating,
    price,
    link,
  ]);

  const modal = createModal(property.title, body);
  document.body.append(modal);
}

export function createResultsMap(properties, mapApiKey = "") {
  const mapEl = document.getElementById("results-map");

  if (!mapEl || typeof L === "undefined") {
    return null;
  }

  mapEl.replaceChildren();

  const map = L.map(mapEl, { scrollWheelZoom: false }).setView(
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
  );

  const tileUrl = mapApiKey
    ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${mapApiKey}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileOptions = mapApiKey
    ? {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    : {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      };

  L.tileLayer(tileUrl, tileOptions).addTo(map);

  const geocoded = properties.filter(
    (property) => property.latitude != null && property.longitude != null,
  );

  const markers = geocoded.map((property) => {
    const icon = L.divIcon({
      className: "price-pin-wrapper",
      html: `<div class="price-pin">$${property.price_per_night}</div>`,
      iconSize: null,
    });

    const marker = L.marker([property.latitude, property.longitude], {
      icon,
    }).addTo(map);

    marker.on("click", () => openPropertyModal(property));

    return marker;
  });

  if (markers.length) {
    const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }

  return map;
}
