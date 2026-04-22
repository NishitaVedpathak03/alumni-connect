const express = require("express")
const router = express.Router()
const pool = require("../db")

// GET messages for a mentorship
router.get("/:mentorshipId", async (req, res) => {
    try {
        const { mentorshipId } = req.params

        const result = await pool.query(
            `SELECT m.id, m.message, m.created_at, m.sender_id, u.name as sender_name
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.mentorship_id = $1
             ORDER BY m.created_at ASC`,
            [mentorshipId]
        )

        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// POST a new message
router.post("/", async (req, res) => {
    try {
        const { mentorship_id, sender_id, message } = req.body

        if (!message || !mentorship_id || !sender_id) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        const newMessage = await pool.query(
            "INSERT INTO messages (mentorship_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *",
            [mentorship_id, sender_id, message]
        )

        // Fetch sender name
        const user = await pool.query("SELECT name FROM users WHERE id=$1", [sender_id])

        const responseData = {
            ...newMessage.rows[0],
            sender_name: user.rows[0].name
        }

        res.json(responseData)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})


module.exports = router
