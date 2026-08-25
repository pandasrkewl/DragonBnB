const path = require("path");
const express = require("express");
const {
  getProperties,
  getPropertyCities,
  getPropertyById,
  getPropertyImages,
  getPropertyImagesByUser,
  getPropertyAmenities,
  getPropertyReviews,
  getPropertyBookings,
  getPropertyBlockings,
  replacePropertyBlockings,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUnreadCountForConversation,
  getBookingsForToday,
  getBookingsUpcoming
} = require("./scripts/queryDb");
const session = require("express-session");
const bcrypt = require("bcrypt");
const pool = require("./db");
const {
  requireLogin,
  verifyUserInConversation,
} = require("./middleware/authMiddleware");

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
      [normalizedEmail],
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
        host ? true : false,
      ],
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

app.get("/api/properties/:id", async (req, res) => {
  try {
    const listingId = req.params.id;
    const property = await getPropertyById(listingId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    console.log("Error: getting properties", error);
    res.status(500).json({
      error: "Could not get property",
    });
  }
});

app.get("/api/properties/:id/images", async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id",
      });
    }

    const images = await getPropertyImages(listingId);

    res.json(images);
  } catch (error) {
    console.log("Error: getting images", error);
    res.status(500).json({
      error: "Could not get property",
    });
  }
});

app.get("/api/property_images/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        error: "Invalid user id"
      });
    }

    const images = await getPropertyImagesByUser(userId);

    res.json(images);
  } catch (error) {
    console.log("Error: gtting images", error);
    res.status(500).json({
      error: "Could not get property images by user id"
    });
  }
})

app.get("/api/properties/:id/amenities", async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id",
      });
    }

    const amenities = await getPropertyAmenities(listingId);

    res.json(amenities);
  } catch (error) {
    console.log("Error: getting amenities", error);
    res.status(500).json({
      error: "Could not get amenities",
    });
  }
});

app.get("/api/properties/:id/reviews", async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id",
      });
    }

    const reviews = await getPropertyReviews(listingId);

    res.json(reviews);
  } catch (error) {
    console.log("Error: getting reviews", error);
    res.status(500).json({
      error: "Could not get reviews",
    });
  }
});

app.get("/api/properties/:id/bookings", async(req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id"
      });
    }

    const bookings = await getPropertyBookings(listingId);

    res.json(bookings);
  } catch (error) {
    console.log("Error: getting bookings", error);
    res.status(500).json({
      error: "Could not get bookings"
    });
  }
});

app.get("/api/properties/:id/blockings", async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({ error: "Invalid property id" });
    }

    const blockings = await getPropertyBlockings(listingId);
    res.json(blockings);
  } catch (error) {
    console.log("Error: getting blockings", error);
    res.status(500).json({ error: "Could not get blockings" });
  }
});

app.put("/api/host/properties/:propertyId/blockings", requireLogin, async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const { dates } = req.body;

    if (!Number.isInteger(propertyId) || propertyId <= 0 || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: "A property id and selected dates are required" });
    }

    const validDates = dates.every((entry) =>
      entry && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && typeof entry.available === "boolean",
    );
    if (!validDates) {
      return res.status(400).json({ error: "Invalid availability dates" });
    }

    const saved = await replacePropertyBlockings(
      propertyId,
      req.session.user.id,
      dates,
    );
    if (!saved) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating property blockings:", error);
    res.status(500).json({ error: "Could not update property availability" });
  }
});

app.get("/listing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "listing.html"));
});

app.get("/messages", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "public", "messages.html"));
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

// Messaging Endpoints

app.get("/api/conversations", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const conversations = await getUserConversations(userId);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

app.get(
  "/api/conversations/:conversationId",
  requireLogin,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const userId = req.session.user.id;

      const isAuthorized = await verifyUserInConversation(
        userId,
        conversationId,
        pool,
      );
      if (!isAuthorized) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await markMessagesAsRead(conversationId, userId);

      const conversation = await getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await getConversationMessages(
        conversationId,
        parseInt(limit),
        parseInt(offset),
      );

      res.json({ conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  },
);

app.post("/api/messages", requireLogin, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.session.user.id;

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const isAuthorized = await verifyUserInConversation(
      senderId,
      conversationId,
      pool,
    );
    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const message = await sendMessage(conversationId, senderId, content.trim());

    res.json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.post("/api/conversations", requireLogin, async (req, res) => {
  try {
    const { hostId, guestId, propertyId } = req.body;
    const userId = req.session.user.id;

    if (userId !== hostId && userId !== guestId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!hostId || !guestId || !propertyId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const conversationId = await createOrGetConversation(
      hostId,
      guestId,
      propertyId,
    );

    const conversation = await getConversationById(conversationId);

    res.json({ success: true, conversation, conversationId });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

app.put(
  "/api/conversations/:conversationId/read",
  requireLogin,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.session.user.id;

      const isAuthorized = await verifyUserInConversation(
        userId,
        conversationId,
        pool,
      );
      if (!isAuthorized) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await markMessagesAsRead(conversationId, userId);

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  },
);

app.get("/api/me/unread-messages", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const unreadCount = await getUnreadMessageCount(userId);
    res.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

app.post(
  "/api/properties/:propertyId/contact-host",
  requireLogin,
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { message: messageContent } = req.body;
      const guestId = req.session.user.id;

      if (!messageContent || !messageContent.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }

      const property = await getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const hostId = property.host_id;

      const conversationId = await createOrGetConversation(
        hostId,
        guestId,
        propertyId,
      );

      await sendMessage(conversationId, guestId, messageContent.trim());

      res.json({ success: true, conversationId });
    } catch (error) {
      console.error("Error contacting host:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.json(null);
  }

  res.json(req.session.user);
});

app.use("/host", requireLogin);

app.get("/api/host/bookings/today", requireLogin, async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!user.host) {
      return res.status(403).json({ error: "Not a host" });
    }

    const bookings = await getBookingsForToday(user.id);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching host bookings for today:", error);
    res.status(500).json({ error: "Could not fetch bookings" });
  }
});

app.get("/api/host/bookings/upcoming", requireLogin, async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!user.host) {
      return res.status(403).json({ error: "Not a host" });
    }

    const bookings = await getBookingsUpcoming(user.id);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching upcoming host bookings:", error);
    res.status(500).json({ error: "Could not fetch upcoming bookings" });
  }
});

app.put("/api/host/properties/:propertyId/price", requireLogin, async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const rawPrice = req.body.price_per_night;
    const pricePerNight = Number(rawPrice);
    const hostId = req.session.user.id;

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return res.status(400).json({ error: "Invalid property id" });
    }

    if (rawPrice === "" || rawPrice === null || rawPrice === undefined ||
      !Number.isFinite(pricePerNight) || pricePerNight < 0 || pricePerNight > 99999999.99) {
      return res.status(400).json({ error: "Price must be between 0 and 99,999,999.99" });
    }

    const result = await pool.query(
      `UPDATE properties
       SET price_per_night = $1
       WHERE id = $2 AND host_id = $3
       RETURNING id, price_per_night`,
      [pricePerNight.toFixed(2), propertyId, hostId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ success: true, property: result.rows[0] });
  } catch (error) {
    console.error("Error updating property price:", error);
    res.status(500).json({ error: "Could not update property price" });
  }
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
