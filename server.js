const path = require("path");
const express = require("express");
const { getProperties, getPropertyById } = require("./scripts/queryDb")

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
}) 

app.get("/listing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "listing.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
