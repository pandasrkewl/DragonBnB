const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.post("/signup", async (req, res) => {
    try {
        const { first_name, last_name, email, password, host } = req.body;
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).send("Email already exists.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users
            (first_name, last_name, email, password_hash, host)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, first_name, host`,
            [
                first_name,
                last_name,
                email,
                hashedPassword,
                host ? true : false
            ]
        );
        
        // Save user in the session
        req.session.user = result.rows[0];
        
        // Redirect home
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error.");
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/me", (req, res) => {
    if (!req.session.user) {
        return res.json(null);
    }
    res.json(req.session.user);
});