require("dotenv").config({ path: __dirname + "/.env" });

const pool = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
    try {
        console.log("🌱 Seeding database...");
        console.log("ENV CHECK:", process.env.DB_PASSWORD);
        // 🔥 1. CREATE TABLES (SAFE)
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
        user_id INTEGER REFERENCES users(id),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log("✅ Tables ensured");

        // 🔥 OPTIONAL: CLEAN OLD DATA (UNCOMMENT IF NEEDED)
        await pool.query("DELETE FROM messages");
        await pool.query("DELETE FROM mentorship_requests");
        await pool.query("DELETE FROM posts");

        // 🔥 2. CREATE USERS
        const hashedPassword = await bcrypt.hash("123456", 10);

        const alumniRes = await pool.query(
            `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
            ["Dr. Sarah Chen", "sarah@example.com", hashedPassword, "ALUMNI"]
        );
        const alumniId = alumniRes.rows[0].id;

        const student1Res = await pool.query(
            `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
            ["Alex Johnson", "alex@example.com", hashedPassword, "STUDENT"]
        );
        const student1Id = student1Res.rows[0].id;

        const student2Res = await pool.query(
            `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
            ["Sam Smith", "sam@example.com", hashedPassword, "STUDENT"]
        );
        const student2Id = student2Res.rows[0].id;

        console.log("✅ Users created");

        // 🔥 3. CREATE REQUESTS (NO DUPLICATES)
        const pendingReq = await pool.query(
            `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING id`,
            [student1Id, alumniId, "Hi Dr. Chen, I'd love to learn about AI."]
        );

        const acceptedReq = await pool.query(
            `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
       VALUES ($1, $2, $3, 'ACCEPTED')
       RETURNING id`,
            [student2Id, alumniId, "Can you mentor me on backend systems?"]
        );

        const mentorshipId = acceptedReq.rows[0].id;

        console.log("✅ Requests created");

        // 🔥 4. CREATE CHAT MESSAGES
        await pool.query(
            `INSERT INTO messages (mentorship_id, sender_id, message) VALUES 
       ($1, $2, 'Hi Sam, happy to help!'),
       ($1, $3, 'Thanks Dr. Chen! When can we meet?')`,
            [mentorshipId, alumniId, student2Id]
        );

        console.log("✅ Messages created");

        // 🔥 5. CREATE POSTS
        await pool.query(
            `INSERT INTO posts (user_id, content) VALUES 
       ($1, 'Hosting a webinar on AI this Friday!'),
       ($2, 'Looking for study partners for Capstone.')`,
            [alumniId, student1Id]
        );

        console.log("✅ Posts created");

        // 🎉 DONE
        console.log("\n🎉 Seeding complete!");
        console.log("👩‍🏫 Alumni: sarah@example.com / 123456");
        console.log("🎓 Student: alex@example.com / 123456");

        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();