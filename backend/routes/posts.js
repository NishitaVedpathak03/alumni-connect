const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all posts
router.get("/", (req, res) => {
  db.all(
    `
    SELECT 
      posts.id,
      posts.content,
      posts.created_at,
      users.name AS user_name,
      users.role AS user_role
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `,
    [],
    (err, rows) => {
      if (err) {
        console.error("❌ GET ERROR:", err);
        return res.status(500).json({ error: "DB error" });
      }

      res.json(rows);
    }
  );
});

// CREATE post
router.post("/", (req, res) => {
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.run(
    "INSERT INTO posts (user_id, content) VALUES (?, ?)",
    [user_id, content],
    function (err) {
      if (err) {
        console.error("❌ POST ERROR:", err);
        return res.status(500).json({ error: "DB error" });
      }

      res.json({
        id: this.lastID,
        content,
        user_name: "You",
        user_role: "student",
        created_at: new Date().toISOString()
      });
    }
  );
});

module.exports = router;