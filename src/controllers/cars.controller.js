const db = require("../config/db.config");

// Helper to calculate pricing (could be moved to a utility)
const calculatePrice = (car, days) => {
  const pricePerDay = parseFloat(car.base_price_online);
  return pricePerDay * days;
};

exports.getAvailableCars = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    console.log("--------------------------------------------------");
    console.log("API Hit: GET /api/cars");
    console.log("Params Received:", req.query);

    if (!start_date || !end_date) {
      return res.status(400).send({ message: "Please providex start_date and end_date." });
    }

    // Query to find cars that DO NOT have a confirmed/active/pending booking that overlaps with the requested dates
    // AND are not in maintenance
    const query = `
      SELECT c.* 
      FROM cars c
      WHERE c.status != 'maintenance'
      AND c.id NOT IN (
        SELECT b.car_id 
        FROM bookings b 
        WHERE b.status IN ('confirmed', 'active', 'pending')
        AND (
          (b.start_date <= ? AND b.end_date >= ?) OR -- Overlaps start
          (b.start_date <= ? AND b.end_date >= ?) OR -- Overlaps end
          (b.start_date >= ? AND b.end_date <= ?)    -- Fully inside
        )
      )
    `;

    // Dates are used multiple times in the query for overlap check
    const queryParams = [end_date, start_date, end_date, start_date, start_date, end_date];

    const [cars] = await db.query(query, queryParams);

    // Calculate estimated total price for convenience if needed,
    // but usually frontend does this. We'll send the raw car data.
    res.status(200).json(cars);
  } catch (err) {
    console.error("Error fetching available cars:", err);
    res.status(500).send({ message: "Error retrieval available cars." });
  }
};

exports.getAllCars = async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM cars");
    res.status(200).json(cars);
  } catch (err) {
    console.error("Error fetching all cars:", err);
    res.status(500).send({ message: "Error retrieving cars." });
  }
};
