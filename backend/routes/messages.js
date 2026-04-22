const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET messages by mentorship
router.get("/:mentorshipId", (req, res) => {
  const { mentorshipId } = req.params;

  db.all(
    `SELECT * FROM messages WHERE mentorship_id = ? ORDER BY created_at ASC`,
    [mentorshipId],
    (err, rows) => {
      if (err) {
        console.error("GET MESSAGES ERROR:", err);
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

// ✅ SEND message
router.post("/", (req, res) => {
  const { mentorship_id, sender_id, message } = req.body;

  db.run(
    `INSERT INTO messages (mentorship_id, sender_id, message)
     VALUES (?, ?, ?)`,
    [mentorship_id, sender_id, message],
    function (err) {
      if (err) {
        console.error("INSERT MESSAGE ERROR:", err);
        return res.status(500).json(err);
      }

      res.json({
        id: this.lastID,
        mentorship_id,
        sender_id,
        message
      });
    }
  );
});

module.exports = router;