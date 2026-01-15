const express = require("express");
const router = express.Router();
const carsController = require("../controllers/cars.controller");
const bookingsController = require("../controllers/bookings.controller");

// Check Availability
router.get("/cars", carsController.getAvailableCars);

// Create Booking
router.post("/create-bookings", bookingsController.createBooking);

module.exports = router;
