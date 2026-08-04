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

module.exports = {
    getUser
};