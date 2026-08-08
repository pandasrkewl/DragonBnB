const pool = require("../db.js");

async function getUser(email) {
  const result = await pool.query(
    "SELECT id, first_name, last_name, email, image_url, host " +
      "FROM users " +
      "WHERE email = $1",
    [email],
  );

  const user = result.rows[0];

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    image_url: user.image_url,
    host: user.host,
  };
}

async function getProperties({
  location,
  sortBy = "rating",
  limit = 10,
  guests = 0,
  checkIn = null,
  checkOut = null,
  pets = 0,
}) {
  const allowedSorts = {
    rating: "p.rating DESC",
    price_low: "p.price_per_night ASC",
    newest: "p.created_at DESC",
  };

  const orderBy = allowedSorts[sortBy] || allowedSorts.rating;
  const searchValue = location || "";
  const filters = [];
  const values = [];
  let paramIndex = 1;

  if (searchValue) {
    filters.push(`p.city ILIKE $${paramIndex}`);
    values.push(`%${searchValue}%`);
    paramIndex += 1;
  }

  if (Number(guests) > 0) {
    filters.push(`p.max_guests >= $${paramIndex}`);
    values.push(Number(guests));
    paramIndex += 1;
  }

  if (Number(pets) > 0) {
    filters.push(`p.pets_allowed = TRUE`);
  }

  if (checkIn && checkOut) {
    filters.push(`NOT EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.property_id = p.id
        AND b.status IN ('confirmed', 'pending')
        AND b.start_date < $${paramIndex}
        AND b.end_date > $${paramIndex + 1}
    )`);
    values.push(checkOut);
    values.push(checkIn);
    paramIndex += 2;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const queryText = `SELECT
      p.id,
      p.title,
      p.city,
      p.state,
      p.price_per_night,
      p.rating,
      p.review_count,
      p.property_type,
      p.max_guests,
      COALESCE(
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.id
          ORDER BY pi.display_order ASC
          LIMIT 1
        ),
        '/placeholders/default_home.jpg'
      ) AS image_url
    FROM properties p
    ${whereClause}
    ORDER BY ${orderBy}${Number.isFinite(limit) && limit > 0 ? `\n    LIMIT $${values.length + 1}` : ""}`;

  const queryParams = [...values];
  if (Number.isFinite(limit) && limit > 0) {
    queryParams.push(limit);
  }

  const result = await pool.query(queryText, queryParams);

  return result.rows;
}

async function getPropertyCities({ query = "" }) {
  const searchValue = query.trim();
  const whereClause = searchValue ? "WHERE city ILIKE $1" : "";
  const values = searchValue ? [`%${searchValue}%`] : [];

  const result = await pool.query(
    `SELECT DISTINCT city
    FROM properties
    ${whereClause}
    ORDER BY city
    LIMIT 8`,
    values,
  );

  return result.rows.map((row) => row.city);
}

module.exports = {
  getUser,
  getProperties,
  getPropertyCities,
};
