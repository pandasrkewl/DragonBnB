const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "DragonBnB/1.0";

async function geocodeAddress({
  address_line_1,
  address_line_2,
  city,
  state,
  postal_code,
  country,
}) {
  const query = [address_line_1, city, state, postal_code, country].filter(Boolean).join(", ");

  const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    return null;
  }

  const results = await response.json();
  const match = results[0];

  if (!match) {
    return null;
  }

  return {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
  };
}

module.exports = { geocodeAddress };
