const express = require("express");
const { getProperties, getPropertyCities } = require("./scripts/queryDb");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

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

app.get("/api/properties", async (req, res) => {
  try {
    const location = req.query.location || req.query.city || "";
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
