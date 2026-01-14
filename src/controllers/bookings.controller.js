const db = require("../config/db.config");

exports.createBooking = async (req, res) => {
  try {
    const {
      car_id,
      start_date,
      end_date,
      with_driver,
      additional_driver,
      driver_age,
      first_name,
      last_name,
      email,
      mobile_number,
      total_price,
      company_name,
      address_line_1,
      address_line_2,
      address_line_3,
      city,
      country,
      postcode,
    } = req.body;

    // 1. Basic Validation
    if (!car_id || !start_date || !end_date) {
      return res.status(400).send({ message: "Missing required booking details." });
    }

    if (driver_age < 21) {
      return res.status(400).send({ message: "Driver must be at least 21 years old." });
    }

    // 2. Double Check Availability (Concurrency safety)
    const checkQuery = `
      SELECT id FROM bookings 
      WHERE car_id = ? 
      AND status IN ('confirmed', 'active', 'pending')
      AND (
        (start_date <= ? AND end_date >= ?) OR 
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      ) LIMIT 1
    `;
    const [existing] = await db.query(checkQuery, [car_id, end_date, start_date, end_date, start_date, start_date, end_date]);

    if (existing.length > 0) {
      return res.status(409).send({ message: "Car is no longer available for these dates." });
    }

    // 3. Create Booking
    const insertQuery = `
      INSERT INTO bookings 
      (car_id, start_date, end_date, with_driver, additional_driver, driver_age, 
       first_name, last_name, email, mobile_number, total_price, 
       company_name, address_line_1, address_line_2, address_line_3, city, country, postcode, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    const [result] = await db.query(insertQuery, [
      car_id,
      start_date,
      end_date,
      with_driver || false,
      additional_driver || false,
      driver_age,
      first_name,
      last_name,
      email,
      mobile_number,
      total_price,
      company_name || null,
      address_line_1,
      address_line_2 || null,
      address_line_3 || null,
      city,
      country,
      postcode,
    ]);

    res.status(201).send({ message: "Booking confirmed successfully!", bookingId: result.insertId });
    console.log("Booking confirmed successfully!", result.insertId);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).send({ message: "Error creating booking." });
  }
};
