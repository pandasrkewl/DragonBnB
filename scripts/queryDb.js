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

module.exports = {
    getUser,
    getProperties
};