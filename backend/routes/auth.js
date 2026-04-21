const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken")

const express = require("express")
const router = express.Router()
const pool = require("../db")
const bcrypt = require("bcrypt")

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
            [name, email, hashedPassword, role]
        )

        res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" })
        }

        const user = result.rows[0]

        const valid = await bcrypt.compare(password, user.password)

        if (!valid) {
            return res.status(400).json({ message: "Invalid password" })
        }

        // 🔐 Create JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            "supersecretkey",
            { expiresIn: "1h" }
        )

        // 🍪 SET COOKIE (THIS IS THE MAIN CHANGE)
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,   // true in production
            sameSite: "lax"
        })

        // Remove password before sending
        const { password: _, ...safeUser } = user

        res.json({
            message: "Login successful",
            user: safeUser
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
})
router.get("/me", auth, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [req.user.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
});

module.exports = router
