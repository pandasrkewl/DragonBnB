const path = require("path");
const express = require("express");
const { getProperties, getPropertyCities, getPropertyById, getPropertyImages, getPropertyAmenities, getPropertyReviews } = require("./scripts/queryDb")
const session = require("express-session");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function isInvalidDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return false;
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return true;
  }

  return startDate > endDate;
}
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }
  })
);

app.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password, host } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists."
      });
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
        normalizedEmail,
        hashedPassword,
        host ? true : false
      ]
    );

    req.session.user = result.rows[0];
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error."
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, password_hash, host
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }
    req.session.user = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      host: user.host
    };
    
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          error: "Could not save session."
        });
      }
    
      res.json({
        success: true,
        user: req.session.user
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error."
    });
  }
});

app.get("/api/properties", async (req, res) => {
  try {
    const location = req.query.location || "";
    const sortBy = req.query.sortBy || "rating";
    const limit =
      req.query.limit === undefined ? null : Number(req.query.limit);
    const guests = Number(req.query.guests || req.query.adults || 0);
    const checkIn = req.query.checkIn || null;
    const checkOut = req.query.checkOut || null;
    const pets = Number(req.query.pets || 0);

    if (isInvalidDateRange(checkIn, checkOut)) {
      res.status(400).json({
        error: "Check-in date must be on or before check-out date.",
      });
      return;
    }

    const properties = await getProperties({
      location,
      sortBy,
      limit,
      guests,
      checkIn,
      checkOut,
      pets,
    });

    res.json(properties);
  } catch (error) {
    console.log("Error: getting properties", error);

    res.status(500).json({
      error: "Could not get properties",
    });
  }
});

app.get("/api/properties/:id", async(req, res) => {
  try {
    const listingId = req.params.id;
    const property = await getPropertyById(listingId);
    if (!property) {
      return res.status(404).json({error: "Property not found"});
    }
    res.json(property);
  } catch (error) {
    console.log("Error: getting properties", error);
    res.status(500).json({
      error: "Could not get property"
    });
  }
});

app.get("/api/properties/:id/images", async(req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id"
      });
    }

    const images = await getPropertyImages(listingId);

    res.json(images);
  } catch (error) {
    console.log("Error: getting images", error);
    res.status(500).json({
      error: "Could not get property"
    });
  }
});

app.get("/api/properties/:id/amenities", async(req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id"
      });
    }

    const amenities = await getPropertyAmenities(listingId);

    res.json(amenities);
  } catch (error) {
    console.log("Error: getting amenities", error);
    res.status(500).json({
      error: "Could not get amenities"
    });
  }
});

app.get("/api/properties/:id/reviews", async(req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id"
      });
    }

    const reviews = await getPropertyReviews(listingId);

    res.json(reviews);
  } catch (error) {
    console.log("Error: getting reviews", error);
    res.status(500).json({
      error: "Could not get reviews"
    });
  }
});

app.get("/listing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "listing.html"));
});

app.get("/api/search-suggestions", async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query.trim()) {
      res.json([]);
      return;
    }

    const cities = await getPropertyCities({ query });
    res.json(cities);
  } catch (error) {
    console.log("Error: getting search suggestions", error);
    res.status(500).json({ error: "Could not get suggestions" });
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

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        error: "Could not log out."
      });
    }

    res.clearCookie("connect.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.redirect("/");
  });
});

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.sendFile(path.join(__dirname, "public", "profile.html"));
});