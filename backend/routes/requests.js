const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ CREATE REQUEST
router.post("/", (req, res) => {
  const { student_id, alumni_id, message } = req.body;

  db.run(
    `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
     VALUES (?, ?, ?, 'PENDING')`,
    [student_id, alumni_id, message],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json({
        id: this.lastID,
        student_id,
        alumni_id,
        status: "PENDING"
      });
    }
  );
});

// ✅ GET requests for ALUMNI
router.get("/alumni/:alumniId", (req, res) => {
  db.all(
    `SELECT mr.id, mr.status, mr.created_at,
            u.name as student_name,
            u.email as student_email,
            u.id as student_id
     FROM mentorship_requests mr
     JOIN users u ON mr.student_id = u.id
     WHERE mr.alumni_id = ?
     ORDER BY mr.created_at DESC`,
    [req.params.alumniId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ✅ GET requests for STUDENT
router.get("/student/:studentId", (req, res) => {
  db.all(
    `SELECT mr.id, mr.status, mr.created_at,
            u.name as alumni_name,
            u.email as alumni_email,
            u.id as alumni_id
     FROM mentorship_requests mr
     JOIN users u ON mr.alumni_id = u.id
     WHERE mr.student_id = ?
     ORDER BY mr.created_at DESC`,
    [req.params.studentId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// ✅ UPDATE (Accept / Reject)
router.patch("/:id", (req, res) => {
  const { status } = req.body;

  db.run(
    `UPDATE mentorship_requests SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({ success: true });
    }
  );
});

// ✅ GET SINGLE MENTORSHIP (for chat)
router.get("/:id", (req, res) => {
  db.get(
    `SELECT mr.*, 
            s.name as student_name,
            a.name as alumni_name,
            a.id as alumni_id,
            s.id as student_id
     FROM mentorship_requests mr
     JOIN users s ON mr.student_id = s.id
     JOIN users a ON mr.alumni_id = a.id
     WHERE mr.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json(err);
      if (!row) return res.status(404).json({ message: "Not found" });

      res.json(row);
    }
  );
});

module.exports = router;