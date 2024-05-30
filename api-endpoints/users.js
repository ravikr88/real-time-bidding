const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
  // const token = req.headers.authorization;
  token = req.headers.authorization.split(" ")[1];
  // ['Bearer', <token> ] so .split(" ")[1] to get token

  if (!token) {
    // no token is provided
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Store user information in request object

    // console.log(
    //   `got profile of authorized user ${req.user.username}`,
    //   req.user
    // );

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// GET /users/profile - Get the profile of the logged-in user
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile from the database
    const userProfileQuery =
      "SELECT id, username, email, role FROM users WHERE id = $1";
    const userProfileResult = await db.query(userProfileQuery, [userId]);

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Return the user profile
    res.json(userProfileResult.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /users/login - Authenticate a user and return a token.
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const userQuery = `
      SELECT id, username, password, email, role FROM users WHERE username = $1;
    `;
    const userResult = await db.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = userResult.rows[0];

    // Verify the password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log(validPassword);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Generate a token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with the token
    res
      .status(200)
      .json({ message: `${username} loggedin successfully`, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Check if the username or email already exists
    const userExistsQuery = `
      SELECT username, email FROM users WHERE username = $1 OR email = $2;
    `;
    const userExistsResult = await db.query(userExistsQuery, [username, email]);

    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ error: "User is already registered" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = `
      INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const newUser = await db.query(insertUserQuery, [
      username,
      hashedPassword,
      email,
      role || "user",
    ]);

    res.status(201).json({
      message: `User ${username} registered successfully`,
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get all users
router.get("/", async (req, res) => {
  try {
    // Execute a query to fetch all items from the database
    const queryResult = await db.query("SELECT * FROM users", []);

    // Send the query result back as the response
    res.json(queryResult.rows);
  } catch (error) {
    // Handle errors
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to retrieve a single auction item by ID
router.get("/:id", async (req, res) => {
  const itemId = req.params.id;

  try {
    // Execute a query to fetch the auction item by its ID
    const queryResult = await db.query("SELECT * FROM users WHERE id = $1", [
      itemId,
    ]);

    // Check if the item exists
    if (queryResult.rows.length === 0) {
      return res.status(404).json({ error: "User  not found" });
    }

    // Send the query result back as the response
    res.json(queryResult.rows[0]);
  } catch (error) {
    // Handle errors
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
