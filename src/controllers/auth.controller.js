const db = require("../config/db.config");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: "Username and password are required." });
    }

    const [users] = await db.query("SELECT id, username, role FROM users WHERE username = ? AND password = ?", [username, password]);

    if (users.length === 0) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    const user = users[0];

    // In a real app we'd use JWT here.
    // For now, we return user data and the frontend will store a flag.
    res.status(200).send({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send({ message: "Error during login." });
  }
};

exports.logout = (req, res) => {
  res.status(200).send({ message: "Logged out successfully" });
};

exports.getProfile = async (req, res) => {
  // Normally we'd get the user ID from the JWT token.
  // For this demo, let's just return the first admin found or a mock.
  try {
    const [users] = await db.query("SELECT id, username, role FROM users LIMIT 1");
    if (users.length > 0) {
      res.status(200).send(users[0]);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ message: "Error fetching profile" });
  }
};
