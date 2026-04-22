const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const express = require("express");
const router = express.Router();
const db = require("../db"); // 🔥 CHANGE HERE
const bcrypt = require("bcrypt");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }

        res.json({
          id: this.lastID,
          name,
          email,
          role,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Server error" });
        }

        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
          { id: user.id, role: user.role },
          "supersecretkey",
          { expiresIn: "1h" }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });

        const { password: _, ...safeUser } = user;

        res.json({
          message: "Login successful",
          user: safeUser,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user
router.get("/me", auth, (req, res) => {
  db.get(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(user);
    }
  );
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

module.exports = router;