require("dotenv").config({ path: __dirname + "/.env" });

const pool = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
    try {
        console.log("🌱 Seeding database...");

        // ✅ CREATE TABLES
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      );

      CREATE TABLE IF NOT EXISTS mentorship_requests (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        alumni_id INTEGER REFERENCES users(id),
        message TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        mentorship_id INTEGER REFERENCES mentorship_requests(id),
        sender_id INTEGER REFERENCES users(id),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log("✅ Tables created");

        const hashedPassword = await bcrypt.hash("123456", 10);

        // ✅ CREATE USERS
        const alumni = await pool.query(
            `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
            ["Dr. Sarah Chen", "sarah@example.com", hashedPassword, "ALUMNI"]
        );

        const student = await pool.query(
            `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
            ["Alex Johnson", "alex@example.com", hashedPassword, "STUDENT"]
        );

        const alumniId = alumni.rows[0].id;
        const studentId = student.rows[0].id;

        console.log("✅ Users created");

        // ✅ CREATE ONE MENTORSHIP
        const mentorship = await pool.query(
            `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
       VALUES ($1, $2, $3, 'ACCEPTED')
       RETURNING id`,
            [studentId, alumniId, "Let's connect"]
        );

        const mentorshipId = mentorship.rows[0].id;

        console.log("✅ Mentorship created");

        // ✅ CREATE MESSAGES
        await pool.query(
            `INSERT INTO messages (mentorship_id, sender_id, message)
       VALUES ($1, $2, 'Hi! Looking forward to connecting')`,
            [mentorshipId, studentId]
        );

        console.log("✅ Messages created");

        // ✅ CREATE POSTS
        await pool.query(
            `INSERT INTO posts (user_id, content)
       VALUES ($1, 'Welcome to the community!')`,
            [alumniId]
        );

        console.log("✅ Posts created");

        console.log("\n🎉 Seeding complete!");
        console.log("Login: alex@example.com / 123456");

        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();