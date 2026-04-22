const express = require("express")
const router = express.Router()
const db = require("../db")

// ✅ GET ALL ALUMNI
router.get("/", (req, res) => {
  db.all(
    "SELECT id, name, email FROM users WHERE role = 'alumni'",
    [],
    (err, rows) => {
      if (err) {
        console.error("ALUMNI ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(rows); // ✅ MUST BE ARRAY
    }
  );
});


// GET profile by user_id
router.get("/profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params

        const result = await pool.query(
            `SELECT ap.*, u.name, u.email 
             FROM users u
             LEFT JOIN alumni_profiles ap ON u.id = ap.user_id 
             WHERE u.id = $1`,
            [userId]
        )

        // If user exists but no profile, return user data with null profile fields
        if (result.rows.length > 0) {
            res.json(result.rows[0])
        } else {
            res.status(404).json({ message: "User not found" })
        }

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// CREATE or UPDATE profile
router.post("/profile", async (req, res) => {
    try {
        const { user_id, company, job_title, graduation_year, bio } = req.body

        const existing = await pool.query(
            "SELECT * FROM alumni_profiles WHERE user_id=$1",
            [user_id]
        )

        if (existing.rows.length > 0) {
            const updated = await pool.query(
                `UPDATE alumni_profiles 
         SET company=$1, job_title=$2, graduation_year=$3, bio=$4 
         WHERE user_id=$5 
         RETURNING *`,
                [company, job_title, graduation_year, bio, user_id]
            )
            return res.json(updated.rows[0])
        }

        const created = await pool.query(
            `INSERT INTO alumni_profiles (user_id, company, job_title, graduation_year, bio)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
            [user_id, company, job_title, graduation_year, bio]
        )

        res.json(created.rows[0])

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
