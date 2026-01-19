const express = require("express");
const router = express.Router();
const carsController = require("../controllers/cars.controller");
const bookingsController = require("../controllers/bookings.controller");
const authController = require("../controllers/auth.controller");

// Check Availability
router.get("/cars", carsController.getAvailableCars);

// Create Booking
router.post("/create-bookings", bookingsController.createBooking);

// Auth
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);

module.exports = router;
