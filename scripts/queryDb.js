const pool = require("../db.js");

async function getUser(id) {
    const result = await pool.query(
        "SELECT id, first_name, last_name, email, image_url, host " +
        "FROM users " +
        "WHERE id = $1",
        [id]
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
        rating: "rating DESC",
        price_low: "p.price_per_night ASC",
        newest: "p.created_at DESC"
    };

  const orderBy = allowedSorts[sortBy] || allowedSorts.rating;
  const searchValue = location || "";
  const filters = [];
  const values = [];
  let paramIndex = 1;

    const result = await pool.query(
        `SELECT
            p.id,
            p.title,
            p.city,
            p.state,
            p.price_per_night,
            COALESCE(
                (
                    SELECT ROUND(AVG(r.rating), 2)
                    FROM reviews r
                    WHERE r.property_id = p.id
                ),
                0    
            ) AS rating,
            (
                SELECT COUNT(*)
                FROM reviews r
                WHERE r.property_id = p.id
            ) AS review_count,
            p.property_type,
            COALESCE(
                (
                    SELECT pi.image_url
                    FROM property_images pi
                    WHERE pi.property_id = p.id
                    ORDER BY pi.display_order ASC
                    LIMIT 1
                ),
                '/assets/placeholders/default_home.jpg'
            ) AS image_url
        FROM properties p
        WHERE p.city ILIKE $1
        ORDER BY ${orderBy}
        LIMIT $2
        `,
        [`%${location}%`, limit]
    );
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
      COALESCE(
          (
              SELECT ROUND(AVG(r.rating), 2)
              FROM reviews r
              WHERE r.property_id = p.id
          ),
          0    
      ) AS rating,
      (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.property_id = p.id
      ) AS review_count,
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

async function getPropertyById(listingId) {
    const result = await pool.query(
        `SELECT
            p.id,
            p.title,
            p.description,
            p.address_line_1,
            p.address_line_2,
            p.city,
            p.state,
            p.postal_code,
            p.country,
            p.max_guests,
            p.bedrooms,
            p.bathrooms,
            p.beds,
            p.price_per_night,
            COALESCE(
                (
                    SELECT ROUND(AVG(r.rating), 2)
                    FROM reviews r
                    WHERE r.property_id = p.id
                ),
                0    
            ) AS rating,
            (
                SELECT COUNT(*)
                FROM reviews r
                WHERE r.property_id = p.id
            ) AS review_count,
            p.property_type,
            p.pets_allowed,
            p.check_in_time,
            p.check_out_time,

            u.id AS host_id,
            u.first_name AS host_first_name,
            u.last_name AS host_last_name, 
            COALESCE(
                u.image_url,
                '/assets/placeholders/default_user.jpg'
            ) AS host_image_url

        FROM properties p
        JOIN users u
            ON p.host_id = u.id

        WHERE p.id = $1`,
        [listingId]
    );

    return result.rows[0];
}

async function getPropertyImages(listingId) {
    const result = await pool.query(
        `SELECT 
            image_url,
            display_order
        FROM property_images
        WHERE property_id = $1
        ORDER BY display_order ASC`,
        [listingId]
    );

    return result.rows;
}

async function getPropertyAmenities(listingId) {
    const result = await pool.query(
        `SELECT 
            a.name, 
            a.basics,
            a.bathroom,
            a.bedroom_and_laundry,
            a.entertainment,
            a.family,
            a.heating_and_cooling,
            a.home_safety, 
            a.internet_and_office,
            a.kitchen_and_dining,
            a.location_features,
            a.outdoor,
            a.parking_and_facilities,
            a.services
        FROM amenities a
        JOIN property_amenities pa
            ON a.id = pa.amenity_id
        WHERE pa.property_id = $1`,
        [listingId]
    );

    return result.rows;
}

async function getPropertyReviews(listingId) {
    const result = await pool.query(
        `SELECT
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            
            u.id AS user_id,
            u.first_name AS user_first_name,
            u.last_name as user_last_name,
            COALESCE(
                u.image_url,
                '/assets/placeholders/default_user.jpg'
            ) AS user_image_url
        
        FROM reviews r
        JOIN users u
            on r.user_id = u.id
        
        WHERE r.property_id = $1

        ORDER BY r.created_at DESC`,
        [listingId]
    );

    return result.rows;
}


module.exports = {
    getUser,
    getProperties,
    getPropertyCities,
    getPropertyById,
    getPropertyImages,
    getPropertyAmenities,
    getPropertyReviews
};
