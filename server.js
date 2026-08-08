const path = require("path");
const express = require("express");
const { getProperties, getPropertyById, getPropertyImages, getPropertyAmenities, getPropertyReviews } = require("./scripts/queryDb")

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

/*app.get("/", (req, res) => {
    res.send("Hello CS375!");
});*/

app.get("/api/properties", async (req, res) => {
  try {
    const city = req.query.city || "Philadelphia";
    const sortBy = req.query.sortBy || "rating";
    const limit = Number(req.query.limit) || 10;

    const properties = await getProperties({
      city,
      sortBy, 
      limit
    });
    res.json(properties);
  } catch (error) {
    console.log("Error: getting properties", error);

    res.status(500).json({
      error: "Could not get properties"
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
