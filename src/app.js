const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware - Server Restart Triggered
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const companyRoutes = require("./routes/company.routes");
const apiRoutes = require("./routes/api.routes");

app.use("/api", companyRoutes);
app.use("/api", apiRoutes);

// Simple route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Car Rental API." });
});

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

module.exports = app;
