const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ CREATE USER
router.post("/", (req, res) => {
  const { name, role } = req.body;

  db.run(
    "INSERT INTO users (name, role) VALUES (?, ?)",
    [name, role],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({
        id: this.lastID,
        name,
        role
      });
    }
  );
});

// ✅ GET ALL USERS
router.get("/", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ✅ 🔥 GET ONLY ALUMNI (IMPORTANT FOR YOU)
router.get("/alumni", (req, res) => {
  db.all(
    "SELECT id, name, email FROM users WHERE role = ?",
    ["alumni"],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ✅ GET USER BY ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id, name, email FROM users WHERE id = ?",
    [id],
    (err, row) => {
      if (err) return res.status(500).json(err);
      if (!row) return res.status(404).json({ message: "User not found" });

      res.json(row);
    }
  );
});

module.exports = router;