const pool = require("../db.js");

async function getUser(id) {
  const result = await pool.query(
    "SELECT id, first_name, last_name, email, image_url, host " +
      "FROM users " +
      "WHERE id = $1",
    [id],
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
            '/assets/placeholders/default_home.jpg'
        ) AS image_url

    FROM properties p
    ${whereClause}
    ORDER BY ${orderBy}
    ${Number.isFinite(limit) && limit > 0 ? `LIMIT $${paramIndex}` : ""}`;

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
    [listingId],
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
    [listingId],
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
    [listingId],
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
    [listingId],
  );

  return result.rows;
}

async function getUserConversations(userId) {
  const result = await pool.query(
    `SELECT 
            c.id,
            c.host_id,
            c.guest_id,
            c.property_id,
            c.created_at,
            c.last_message_at,
            p.title AS property_title,
            CASE 
                WHEN c.host_id = $1 THEN u_guest.id
                ELSE u_host.id
            END AS other_user_id,
            CASE 
                WHEN c.host_id = $1 THEN u_guest.first_name || ' ' || u_guest.last_name
                ELSE u_host.first_name || ' ' || u_host.last_name
            END AS other_user_name,
            CASE 
                WHEN c.host_id = $1 THEN u_guest.image_url
                ELSE u_host.image_url
            END AS other_user_image,
            CASE 
                WHEN c.host_id = $1 THEN 'host'
                ELSE 'guest'
            END AS user_role,
            m.message AS last_message,
            m.sender_id AS last_message_sender_id,
            COUNT(CASE WHEN m.read = FALSE AND m.sender_id != $1 THEN 1 END) AS unread_count
        FROM conversations c
        JOIN users u_host ON c.host_id = u_host.id
        JOIN users u_guest ON c.guest_id = u_guest.id
        JOIN properties p ON c.property_id = p.id
        LEFT JOIN messages m ON c.id = m.conversation_id
        WHERE c.host_id = $1 OR c.guest_id = $1
        GROUP BY c.id, u_guest.id, u_host.id, p.id, m.message, m.sender_id
        ORDER BY c.last_message_at DESC`,
    [userId],
  );

  return result.rows;
}

async function getConversationById(conversationId) {
  const result = await pool.query(
    `SELECT 
            c.id,
            c.host_id,
            c.guest_id,
            c.property_id,
            c.created_at,
            c.last_message_at,
            p.title AS property_title,
            p.address_line_1 AS property_address,
            u_host.id AS host_id,
            u_host.first_name || ' ' || u_host.last_name AS host_name,
            u_host.image_url AS host_image,
            u_guest.id AS guest_id,
            u_guest.first_name || ' ' || u_guest.last_name AS guest_name,
            u_guest.image_url AS guest_image
        FROM conversations c
        JOIN users u_host ON c.host_id = u_host.id
        JOIN users u_guest ON c.guest_id = u_guest.id
        JOIN properties p ON c.property_id = p.id
        WHERE c.id = $1`,
    [conversationId],
  );

  return result.rows[0];
}

async function getConversationMessages(conversationId, limit = 50, offset = 0) {
  const result = await pool.query(
    `SELECT 
            m.id,
            m.conversation_id,
            m.sender_id,
            u.first_name || ' ' || u.last_name AS sender_name,
            u.image_url AS sender_image,
            m.message,
            m.created_at,
            m.read,
            m.read_at
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC
        LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset],
  );

  return result.rows;
}

async function createOrGetConversation(hostId, guestId, propertyId) {
  let result = await pool.query(
    `SELECT id FROM conversations 
         WHERE host_id = $1 AND guest_id = $2 AND property_id = $3`,
    [hostId, guestId, propertyId],
  );

  if (result.rows.length > 0) {
    return result.rows[0].id;
  }

  result = await pool.query(
    `INSERT INTO conversations (host_id, guest_id, property_id, last_message_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING id`,
    [hostId, guestId, propertyId],
  );

  return result.rows[0].id;
}

async function sendMessage(conversationId, senderId, content) {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, message, created_at, read)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, FALSE)
         RETURNING id, conversation_id, sender_id, message, created_at, read`,
    [conversationId, senderId, content],
  );

  await pool.query(
    `UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [conversationId],
  );

  return result.rows[0];
}

async function markMessagesAsRead(conversationId, userId) {
  const result = await pool.query(
    `UPDATE messages 
         SET read = TRUE, read_at = CURRENT_TIMESTAMP
         WHERE conversation_id = $1 AND sender_id != $2 AND read = FALSE
         RETURNING id`,
    [conversationId, userId],
  );

  return result.rows;
}

async function getUnreadMessageCount(userId) {
  const result = await pool.query(
    `SELECT COUNT(*) as unread_count
         FROM messages m
         WHERE m.read = FALSE 
         AND m.conversation_id IN (
            SELECT id FROM conversations 
            WHERE host_id = $1 OR guest_id = $1
         )
         AND m.sender_id != $1`,
    [userId],
  );

  return parseInt(result.rows[0].unread_count, 10);
}

async function getUnreadCountForConversation(conversationId, userId) {
  const result = await pool.query(
    `SELECT COUNT(*) as unread_count
         FROM messages
         WHERE conversation_id = $1 
         AND sender_id != $2 
         AND read = FALSE`,
    [conversationId, userId],
  );

  return parseInt(result.rows[0].unread_count, 10);
}

async function deleteConversation(conversationId) {
  const result = await pool.query(
    `DELETE FROM conversations WHERE id = $1 RETURNING id`,
    [conversationId],
  );

  return result.rows.length > 0;
}

module.exports = {
  getUser,
  getProperties,
  getPropertyCities,
  getPropertyById,
  getPropertyImages,
  getPropertyAmenities,
  getPropertyReviews,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUnreadCountForConversation,
  deleteConversation,
};
