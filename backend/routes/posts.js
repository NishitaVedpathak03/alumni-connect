const express = require("express")
const router = express.Router()
const pool = require("../db")

// GET all posts
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.id, p.content, p.created_at, u.name as user_name, u.role as user_role 
             FROM posts p 
             JOIN users u ON p.user_id = u.id 
             ORDER BY p.created_at DESC`
        )
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

// CREATE a new post
router.post("/", async (req, res) => {
    try {
        const { user_id, content } = req.body

        if (!content || !user_id) {
            return res.status(400).json({ message: "Content and User ID are required" })
        }

        const newPost = await pool.query(
            "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *",
            [user_id, content]
        )

        // Fetch the user details to return with the post immediately
        const user = await pool.query("SELECT name, role FROM users WHERE id=$1", [user_id])

        const responseData = {
            ...newPost.rows[0],
            user_name: user.rows[0].name,
            user_role: user.rows[0].role
        }

        res.json(responseData)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router
