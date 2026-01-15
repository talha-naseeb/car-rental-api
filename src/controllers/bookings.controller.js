const db = require("../config/db.config");

exports.createBooking = async (req, res) => {
  try {
    // 0. Retell AI Payload Handling
    // Retell AI wraps arguments in an "args" object. We need to unwrap it if present.
    const payload = req.body.args || req.body;

    const {
      car_id,
      car_name, // Re-added for Retell AI lookup/logging
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
      id_card,
      passport_id,
      extra_details,
    } = payload;

    console.log("------------------------------------------------");
    console.log("📝 INCOMING BOOKING REQUEST (Retell AI Debug) 📝");
    console.log("------------------------------------------------");
    console.log("Raw Payload:", JSON.stringify(payload, null, 2));
    console.log("------------------------------------------------");

    // 1. Resolve Car ID if missing but Name provided
    let finalCarId = car_id;
    if (!finalCarId && car_name) {
      console.log(`Searching for car by name: "${car_name}"...`);
      const [cars] = await db.query("SELECT id FROM cars WHERE name LIKE ? LIMIT 1", [`%${car_name}%`]);
      if (cars.length > 0) {
        finalCarId = cars[0].id;
        console.log(`Found Car ID: ${finalCarId} for name: "${car_name}"`);
      } else {
        console.warn(`Car not found by name: "${car_name}"`);
      }
    }

    // 2. Minimal Validation (As requested)
    // Only fail if we absolutely cannot create a DB record
    if (!start_date || !end_date) {
      return res.status(400).send({ message: "Dates are required to book." });
    }

    if (!id_card && !passport_id) {
      console.log("ℹ️ Booking created without ID. Documents to be collected at delivery.");
    }

    if (driver_age < 21) {
      return res.status(400).send({ message: "Driver must be at least 21 years old." });
    }

    // 3. Check Availability & Calculate Price
    // We need to fetch the price per day from the car details
    const availabilityQuery = `
        SELECT id, base_price_online, base_price_offline FROM cars 
        WHERE id = ? LIMIT 1
    `;
    const [carDetails] = await db.query(availabilityQuery, [finalCarId]);

    if (carDetails.length === 0) {
      return res.status(404).send({ message: "Car not found." });
    }

    const { base_price_online } = carDetails[0];

    // Calculate Days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

    // Calculate Total Price if not provided
    let calculatedPrice = total_price;
    if (!calculatedPrice) {
      calculatedPrice = base_price_online * diffDays;
      console.log(`💰 Price Calculated: ${base_price_online} * ${diffDays} days = ${calculatedPrice}`);
    }

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
    const [existing] = await db.query(checkQuery, [finalCarId, end_date, start_date, end_date, start_date, start_date, end_date]);

    if (existing.length > 0) {
      return res.status(409).send({ message: "Car is no longer available for these dates." });
    }

    // 4. Create Booking
    // Default status is 'pending' for online/AI bookings
    const insertQuery = `
        INSERT INTO bookings 
        (car_id, start_date, end_date, with_driver, additional_driver, driver_age, 
        first_name, last_name, email, mobile_number, total_price, 
        company_name, address_line_1, address_line_2, address_line_3, city, country, postcode, 
        passport_id, id_card, extra_details, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

    const [result] = await db.query(insertQuery, [
      finalCarId,
      start_date,
      end_date,
      with_driver || false,
      additional_driver || false,
      driver_age,
      first_name,
      last_name,
      email,
      mobile_number,
      calculatedPrice, // Use calculated price
      company_name || null,
      address_line_1,
      address_line_2 || null,
      address_line_3 || null,
      city || null,
      country,
      postcode || null,
      passport_id || null,
      id_card || null,
      extra_details || null,
    ]);

    res.status(201).send({ message: "Booking confirmed successfully!", bookingId: result.insertId });
    console.log("Booking confirmed successfully!", result.insertId);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).send({ message: "Error creating booking." });
  }
};
