require("dotenv").config();

const path = require("path");
const express = require("express");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
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
  createProperty,
  getHostProperties,
  addPropertyAmenities,
  addPropertyImage,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  createOrGetConversation,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUnreadCountForConversation,
  getBookingsForToday,
  getBookingsUpcoming,
  getBookingsPast,
  getWishlist,
  toggleWishlist,
} = require("./scripts/queryDb");
const { geocodeAddress } = require("./scripts/geocode");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcrypt");
const pool = require("./db");
const {
  requireLogin,
  verifyUserInConversation,
} = require("./middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/images/properties");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

const server = http.createServer(app);
const allowedOrigins = [
  "https://drexel-bnb.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://localhost:8080",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.indexOf("vercel.app") > -1) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("sendMessage", (messageData) => {
    socket.to(messageData.conversation_id).emit("receiveMessage", messageData);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/config", (req, res) => {
  res.json({
    mapApiKey: process.env.MAP_API_KEY || "",
  });
});

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
const sessionStore = new pgSession({
  pool,
  tableName: "session",
  schemaName: "public",
});

async function getPropertyEditAccess(propertyId, userId) {
  const result = await pool.query(
    `SELECT
       p.id,
       EXISTS (
         SELECT 1
         FROM bookings b
         WHERE b.property_id = p.id
           AND b.status IN ('pending', 'confirmed')
       ) AS has_bookings
     FROM properties p
     WHERE p.id = $1 AND p.host_id = $2`,
    [propertyId, userId],
  );

  return result.rows[0] || null;
}

async function requireEditableProperty(req, res) {
  const propertyId = Number(req.params.id);
  const access = await getPropertyEditAccess(propertyId, req.session.user.id);

  if (!access) {
    res.status(404).json({
      error: "Property not found or you do not own this property",
    });
    return null;
  }

  if (access.has_bookings) {
    res.status(409).json({
      error: "Properties with bookings cannot be edited or deleted",
    });
    return null;
  }

  return access;
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);

app.post("/api/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password, host } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users
        (first_name, last_name, email, password_hash, host)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, host`,
      [first_name, last_name, normalizedEmail, hashedPassword, true],
    );

    req.session.user = result.rows[0];
    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error.",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, password_hash, host, image_url
       FROM users
       WHERE email = $1`,
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }
    req.session.user = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      host: user.host,
      image_url: user.image_url,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          error: "Could not save session.",
        });
      }

      res.json({
        success: true,
        user: req.session.user,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error.",
    });
  }
});

app.post("/api/reviews", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const {
      bookingId,
      rating,
      comment
    } = req.body;

    const numericRating = Number(rating);

    
    const numericBookingId = Number(bookingId);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        error: "Rating got to be between 1 and 5"
      });
    }

    if (
      !Number.isInteger(numericBookingId) ||
      numericBookingId <= 0
    ) {
      return res.status(400).json({
        error: "Invalid booking"
      });
    }

    const bookingResult = await pool.query(
      `SELECT
         b.id,
         b.property_id,
         b.status,
         b.end_date
       FROM bookings b
       WHERE b.id = $1
         AND b.user_id = $2`,
      [numericBookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        error: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "completed") {
      return res.status(400).json({
        error: "You can only review completed trips"
      });
    }

    const existingReview = await pool.query(
      `SELECT id
       FROM reviews
       WHERE booking_id = $1`,
      [numericBookingId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({
        error: "You already reviewed this trip"
      });
    }

    const result = await pool.query(
      `INSERT INTO reviews (
         rating,
         comment,
         user_id,
         property_id,
         booking_id
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        numericRating,
        comment?.trim() || null,
        userId,
        booking.property_id,
        numericBookingId
      ]
    );

    res.status(201).json({
      success: true,
      review: result.rows[0]
    });

  } catch (error) {
    console.error("Error creating review:", error);

    res.status(500).json({
      error: "Could not create review"
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
      userId: req.session.user?.id,
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
    const property = await getPropertyById(listingId, req.session.user?.id);
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

app.get("/api/properties/:id/bookings", async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id",
      });
    }

    const bookings = await getPropertyBookings(listingId);

    res.json(bookings);
  } catch (error) {
    console.log("Error: getting bookings", error);
    res.status(500).json({
      error: "Could not get bookings",
    });
  }
});

app.get("/api/properties/:id/blockings", async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({
        error: "Invalid property id",
      });
    }

    const blockings = await getPropertyBlockings(listingId);
    res.json(blockings);
  } catch (error) {
    console.log("Error: getting blockings", error);
    res.status(500).json({
      error: "Could not get blockings",
    });
  }
});

app.put("/api/host/properties/:propertyId/blockings", requireLogin, async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const hostId = req.session.user.id;
    const { dates, reason } = req.body;

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return res.status(400).json({ error: "Invalid property id" });
    }

    if (!Array.isArray(dates)) {
      return res.status(400).json({ error: "Dates are required" });
    }

    const saved = await replacePropertyBlockings(propertyId, hostId, dates, reason || "");

    if (!saved) {
      return res.status(404).json({
        error: "Property not found or you do not own this property",
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating property blockings:", error);
    res.status(500).json({
      error: "Could not update property blockings",
    });
  }
});

app.get("/listing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "listing.html"));
});

app.get("/messages", requireLogin, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
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

app.post("/api/bookings", requireLogin, async (req, res) => {
  try {
    const { propertyId, startDate, endDate, totalPrice, message } = req.body;

    const guestId = req.session.user.id;

    if (!propertyId || !startDate || !endDate || totalPrice == null) {
      return res.status(400).json({
        error: "Missing booking information",
      });
    }

    const existingBooking = await pool.query(
      `SELECT id
       FROM bookings
       WHERE property_id = $1
         AND user_id = $2
         AND start_date = $3
         AND end_date = $4
         AND status = 'pending'
       LIMIT 1`,
      [propertyId, guestId, startDate, endDate],
    );

    if (existingBooking.rows.length > 0) {
      return res.status(409).json({
        error: "You already requested this booking.",
      });
    }

    const property = await getPropertyById(propertyId);

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    const bookingResult = await pool.query(
      `INSERT INTO bookings (
        property_id,
        user_id,
        start_date,
        end_date,
        total_price,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING id`,
      [propertyId, guestId, startDate, endDate, totalPrice],
    );

    const bookingId = bookingResult.rows[0].id;

    const conversationId = await createOrGetConversation(
      property.host_id,
      guestId,
      propertyId,
    );

    const reservationRequest = JSON.stringify({
      type: "reservation_request",
      bookingId: bookingId,
      property: property.title,
      startDate: startDate,
      endDate: endDate,
      total: totalPrice,
      status: "pending",
      image: property.image_url,
    });

    await sendMessage(conversationId, guestId, reservationRequest);

    if (message && message.trim()) {
      await sendMessage(conversationId, guestId, message.trim());
    }

    res.status(201).json({
      success: true,
      bookingId,
      conversationId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    res.status(500).json({
      error: "Could not create booking",
    });
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

app.get("/listing/:propertyId/book", async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return res.status(400).json({ error: "Invalid property id" });
    }

    const property = await getPropertyById(propertyId);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.sendFile(path.join(__dirname, "public", "book.html"));
  } catch (error) {
    console.error("Error loading booking page:", error);
    res.status(500).send("Could not load booking page");
  }
});

app.post("/api/properties", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const {
      title,
      description,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      max_guests,
      bedrooms,
      bathrooms,
      beds,
      price_per_night,
      property_type,
      pets_allowed,
      check_in_time,
      check_out_time,
    } = req.body;

    if (
      !title ||
      !address_line_1 ||
      !city ||
      !state ||
      !postal_code ||
      !country ||
      !max_guests ||
      bedrooms === undefined ||
      bathrooms === undefined ||
      beds === undefined ||
      !price_per_night ||
      !property_type
    ) {
      return res.status(400).json({
        error: "Missing required property information",
      });
    }

    const geocoded = await geocodeAddress({
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
    });

    if (!geocoded) {
      return res.status(400).json({
        error:
          "We couldn't verify that address. Please check it and try again.",
      });
    }

    const property = await createProperty({
      host_id: userId,
      title,
      description,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      max_guests,
      bedrooms,
      bathrooms,
      beds,
      price_per_night,
      property_type,
      pets_allowed,
      check_in_time,
      check_out_time,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Error creating property:", error);

    res.status(500).json({
      error: "Could not create property",
    });
  }
});

app.get("/api/host/properties", requireLogin, async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.id) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    if (!user.host) {
      return res.status(403).json({
        error: "Not a host",
      });
    }

    const properties = await getHostProperties(user.id);

    res.json(properties);
  } catch (error) {
    console.error("Error getting host properties:", error);

    res.status(500).json({
      error: "Could not get host properties",
    });
  }
});

app.post(
  "/api/properties/:id/images",
  requireLogin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const propertyId = Number(req.params.id);

      if (!(await requireEditableProperty(req, res))) {
        return;
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "No images uploaded",
        });
      }

      const savedImages = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const imageUrl = `/assets/images/properties/${file.filename}`;

        const image = await addPropertyImage(propertyId, imageUrl, i);

        savedImages.push(image);
      }

      res.status(201).json(savedImages);
    } catch (error) {
      console.error("Error uploading property images:", error);

      res.status(500).json({
        error: "Could not upload images",
      });
    }
  },
);

app.post("/api/properties/:id/amenities", requireLogin, async (req, res) => {
  try {
    const propertyId = Number(req.params.id);

    if (!(await requireEditableProperty(req, res))) {
      return;
    }

    const { amenities } = req.body;

    if (!Array.isArray(amenities)) {
      return res.status(400).json({
        error: "Amenities must be an array",
      });
    }

    await addPropertyAmenities(propertyId, amenities);

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.error("Error saving property amenities:", error);

    res.status(500).json({
      error: "Could not save amenities",
    });
  }
});

app.put("/api/properties/:id", requireLogin, async (req, res) => {
  try {
    const propertyId = Number(req.params.id);
    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return res.status(400).json({
        error: "Invalid property id",
      });
    }

    if (!(await requireEditableProperty(req, res))) {
      return;
    }

    const {
      property_type,
      title,
      description,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      max_guests,
      bedrooms,
      bathrooms,
      beds,
      pets_allowed,
      check_in_time,
      check_out_time,
      price_per_night,
    } = req.body;

    if (
      !property_type ||
      !title ||
      !address_line_1 ||
      !city ||
      !state ||
      !postal_code ||
      !country ||
      !max_guests ||
      bedrooms === undefined ||
      bathrooms === undefined ||
      beds === undefined ||
      !price_per_night
    ) {
      return res.status(400).json({
        error: "Missing required property information",
      });
    }

    const result = await pool.query(
      `UPDATE properties
         SET
           property_type = $1,
           title = $2,
           description = $3,
           address_line_1 = $4,
           address_line_2 = $5,
           city = $6,
           state = $7,
           postal_code = $8,
           country = $9,
           max_guests = $10,
           bedrooms = $11,
           bathrooms = $12,
           beds = $13,
           pets_allowed = $14,
           check_in_time = $15,
           check_out_time = $16,
           price_per_night = $17
         WHERE id = $18
         AND host_id = $19
         RETURNING *`,
      [
        property_type,
        title,
        description,
        address_line_1,
        address_line_2 || null,
        city,
        state,
        postal_code,
        country,
        max_guests,
        bedrooms,
        bathrooms,
        beds,
        pets_allowed ?? false,
        check_in_time || null,
        check_out_time || null,
        price_per_night,
        propertyId,
        req.session.user.id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Property not found or you do not own this property",
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({
      error: "Could not update property",
    });
  }
});

app.delete("/api/properties/:id", requireLogin, async (req, res) => {
  let client;

  try {
    const propertyId = Number(req.params.id);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return res.status(400).json({ error: "Invalid property id" });
    }

    if (!(await requireEditableProperty(req, res))) {
      return;
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const property = await client.query(
      `SELECT id
         FROM properties
         WHERE id = $1
         AND host_id = $2`,
      [propertyId, req.session.user.id],
    );

    if (property.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Property not found or you do not own this property",
      });
    }

    await client.query("DELETE FROM reviews WHERE property_id = $1", [propertyId]);
    await client.query("DELETE FROM bookings WHERE property_id = $1", [propertyId]);
    await client.query(
      "DELETE FROM properties WHERE id = $1 AND host_id = $2",
      [propertyId, req.session.user.id],
    );
    await client.query("COMMIT");

    res.json({
      success: true,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    console.error("Error deleting property:", error);

    res.status(500).json({
      error: "Could not delete property",
    });
  } finally {
    client?.release();
  }
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.json(null);
  }

  res.json(req.session.user);
});

app.get("/api/wishlist", requireLogin, async (req, res) => {
  try {
    const wishlist = await getWishlist(req.session.user.id);
    res.json(wishlist);
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({ error: "Could not get wishlist" });
  }
});

app.post("/api/wishlist/:propertyId", requireLogin, async (req, res) => {
  try {
    const propertyId = Number(req.params.propertyId);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return res.status(400).json({ error: "Invalid property id" });
    }

    const property = await pool.query("SELECT id FROM properties WHERE id = $1", [
      propertyId,
    ]);
    if (property.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const isFavorited = await toggleWishlist(req.session.user.id, propertyId);
    res.json({ propertyId, isFavorited });
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res.status(500).json({ error: "Could not update wishlist" });
  }
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

app.put("/api/bookings/:bookingId/status", requireLogin, async (req, res) => {
  const client = await pool.connect();

  try {
    const bookingId = Number(req.params.bookingId);
    const { status } = req.body;
    const hostId = req.session.user.id;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        error: "Invalid booking id",
      });
    }

    if (!["confirmed", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({
        error: "Invalid booking status",
      });
    }

    await client.query("BEGIN");

    const bookingResult = await client.query(
      `SELECT
          b.id,
          b.property_id,
          b.user_id,
          b.start_date,
          b.end_date,
          b.total_price,
          b.status,
          p.title,
          p.host_id,
          COALESCE(
            (
              SELECT pi.image_url
              FROM property_images pi
              WHERE pi.property_id = p.id
              ORDER BY pi.display_order ASC
              LIMIT 1
            ),
            '/assets/placeholders/default_home.jpg'
          ) AS property_image
       FROM bookings b
       JOIN properties p
         ON p.id = b.property_id
       WHERE b.id = $1
       FOR UPDATE`,
      [bookingId],
    );

    if (bookingResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.host_id !== hostId) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        error: "You are not the host for this property",
      });
    }

    if (status === "cancelled") {
      if (booking.status !== "confirmed") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error: "Only confirmed bookings can be cancelled",
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingStart = new Date(booking.start_date);
      bookingStart.setHours(0, 0, 0, 0);

      if (bookingStart <= today) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error: "This booking has already started or is in progress",
        });
      }
    } else {
      if (booking.status !== "pending") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error: "This booking has already been handled",
        });
      }
    }

    await client.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2`,
      [status, bookingId],
    );

    let conflictingBookings = [];

    if (status === "confirmed") {
      const conflictResult = await client.query(
        `UPDATE bookings
         SET status = 'rejected'
         WHERE property_id = $1
           AND id != $2
           AND status = 'pending'
           AND start_date < $3
           AND end_date > $4

         RETURNING
           id,
           user_id,
           start_date,
           end_date,
           total_price`,
        [booking.property_id, bookingId, booking.end_date, booking.start_date],
      );

      conflictingBookings = conflictResult.rows;
    }

    await client.query("COMMIT");

    const conversationId = await createOrGetConversation(
      hostId,
      booking.user_id,
      booking.property_id,
    );

    const statusLabel =
      status === "confirmed"
        ? "accepted"
        : status === "cancelled"
          ? "cancelled"
          : "rejected";

    const actionMessage = JSON.stringify({
      type: "reservation_action",
      status: statusLabel,
      property: booking.title,
      dates: `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}`,
      image: booking.property_image,
    });

    const savedMessage = await sendMessage(
      conversationId,
      hostId,
      actionMessage,
    );

    io.to(String(conversationId)).emit("receiveMessage", savedMessage);
    if (status === "confirmed") {
      for (const conflict of conflictingBookings) {
        const conflictConversationId = await createOrGetConversation(
          hostId,
          conflict.user_id,
          booking.property_id,
        );

        const rejectedMessage = JSON.stringify({
          type: "reservation_action",
          status: "rejected",
          property: booking.title,
          dates:
            `${new Date(conflict.start_date).toLocaleDateString()} - ` +
            `${new Date(conflict.end_date).toLocaleDateString()}`,
          image: booking.property_image,
        });

        const savedRejectedMessage = await sendMessage(
          conflictConversationId,
          hostId,
          rejectedMessage,
        );

        io.to(String(conflictConversationId)).emit(
          "receiveMessage",
          savedRejectedMessage,
        );
      }
    }

    res.json({
      success: true,
      status,
      message: savedMessage,
      rejectedConflicts: conflictingBookings.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error updating booking:", error);

    res.status(500).json({
      error: "Could not update booking",
    });
  } finally {
    client.release();
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

app.get("/api/host/bookings/past", requireLogin, async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || !user.id) {
      return res.status(401).json({
        error: "Not authenticated"
      });
    }

    if (!user.host) {
      return res.status(403).json({
        error: "Not a host"
      });
    }

    const bookings = await getBookingsPast(user.id);

    res.json(bookings);

  } catch (error) {
    console.error("Error fetching past host bookings:", error);

    res.status(500).json({
      error: "Could not fetch past bookings"
    });
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

app.get("/api/logout", requireLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        error: "Could not log out.",
      });
    }

    res.clearCookie("connect.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.redirect("/");
  });
});

app.get("/profile", requireLogin, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.get("/favorites", requireLogin, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.sendFile(path.join(__dirname, "public", "favorites.html"));
});

app.get("/api/trips", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const result = await pool.query(
      `SELECT
         b.id AS booking_id,
         b.property_id,
         b.start_date,
         b.end_date,
         b.total_price,
         b.status,

         p.title,
         p.city,
         p.state,

         host.first_name AS host_first_name,
         host.last_name AS host_last_name,

         r.id AS review_id,
         r.rating AS review_rating,
         r.comment AS review_comment,

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

       FROM bookings b

       JOIN properties p
         ON p.id = b.property_id

       JOIN users host
         ON host.id = p.host_id

       LEFT JOIN reviews r
         ON r.booking_id = b.id

       WHERE b.user_id = $1

       ORDER BY b.start_date DESC`,
      [userId]
    );


    const upcoming = [];
    const past = [];


    result.rows.forEach((booking) => {
      const bookingForList = {
        ...booking,
        status: booking.status,
      };

      if (["completed", "cancelled", "rejected"].includes(booking.status)) {
        past.push(bookingForList);
      } else {
        upcoming.push(bookingForList);
      }

    });


    upcoming.sort(
      (a, b) =>
        new Date(a.start_date) -
        new Date(b.start_date)
    );


    past.sort(
      (a, b) =>
        new Date(b.start_date) -
        new Date(a.start_date)
    );


    res.json({
      upcoming,
      past
    });


  } catch (error) {
    console.error(
      "Error fetching trips:",
      error
    );

    res.status(500).json({
      error: "Could not fetch trips"
    });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} with Socket.io`);
  });
}

module.exports = app;
module.exports.io = io;
module.exports.server = server;
