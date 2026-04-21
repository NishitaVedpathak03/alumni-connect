const express = require("express");
const router = express.Router();
const pool = require("../db");


// ✅ CREATE REQUEST
router.post("/", async (req, res) => {
  const { student_id, alumni_id, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING id, student_id, alumni_id, status`,
      [student_id, alumni_id, message]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET requests for ALUMNI (incoming)
router.get("/alumni/:alumniId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.id, mr.status, mr.created_at,
              u.name as student_name,
              u.email as student_email,
              u.id as student_id
       FROM mentorship_requests mr
       JOIN users u ON mr.student_id = u.id
       WHERE mr.alumni_id = $1
       ORDER BY mr.created_at DESC`,
      [req.params.alumniId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET requests for STUDENT (outgoing) ⭐ FIXED
router.get("/student/:studentId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.id, mr.status, mr.created_at,
              u.name as alumni_name,
              u.email as alumni_email,
              u.id as alumni_id
       FROM mentorship_requests mr
       JOIN users u ON mr.alumni_id = u.id
       WHERE mr.student_id = $1
       ORDER BY mr.created_at DESC`,
      [req.params.studentId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ UPDATE request (Accept / Reject)
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await pool.query(
      `UPDATE mentorship_requests
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;