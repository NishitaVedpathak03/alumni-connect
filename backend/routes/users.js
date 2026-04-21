const express = require("express");
const router = express.Router();
const db = require("../db");

// Create user
router.post("/", async (req, res) => {
    const { name, role } = req.body;

    const result = await db.query(
        "INSERT INTO users (name, role) VALUES ($1, $2) RETURNING *",
        [name, role]
    );

    res.json(result.rows[0]);
});

// Get users
router.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
});

// 👉 GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await db.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router;