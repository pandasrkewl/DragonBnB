const express = require("express");
const app = express();

app.use(express.static("public"));

/*app.get("/", (req, res) => {
    res.send("Hello CS375!");
});*/

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});