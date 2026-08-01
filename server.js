const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

/*app.get("/", (req, res) => {
    res.send("Hello CS375!");
});*/

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
