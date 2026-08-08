const pool = require("../db.js");

async function getUser(email) {
    const result = await pool.query(
        "SELECT id, first_name, last_name, email, image_url, host " +
        "FROM users " +
        "WHERE email = $1",
        [email]
    );

    let user = result.rows[0];
    
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        image_url: user.image_url,
        host: user.host
    };
}

async function getProperties({
    city,
    sortBy = "rating",
    limit = 10
}) {
    const allowedSorts = {
        rating: "p.rating DESC",
        price_low: "p.price_per_night ASC",
        newest: "p.created_at DESC"
    };

    const orderBy = allowedSorts[sortBy] || allowedSorts.rating;

    const result = await pool.query(
        `SELECT
            p.id,
            p.title,
            p.city,
            p.state,
            p.price_per_night,
            p.rating,
            p.review_count,
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
        [`%${city}%`, limit]
    );

    return result.rows;
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
            p.rating,
            p.review_count,
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


module.exports = {
    getUser,
    getProperties,
    getPropertyById,
    getPropertyImages
};