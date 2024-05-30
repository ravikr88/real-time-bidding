const express = require("express");
const db = require("../database/db.js"); // Import the db module

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Execute a query to fetch all items from the database
    const queryResult = await db.query("SELECT * FROM notifications", []);

    // Send the query result back as the response
    res.json(queryResult.rows);
  } catch (error) {
    // Handle errors
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to retrieve a single auction item by ID
router.get("/:id", async (req, res) => {
  const itemId = req.params.id;

  try {
    // Execute a query to fetch the auction item by its ID
    const queryResult = await db.query(
      "SELECT * FROM notifications WHERE id = $1",
      [itemId]
    );

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

// router.put("/:id", (req, res) => {
//   res.send(`update item with id ${req.params.id}`);
// });
module.exports = router;
