const pool = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
    try {
        console.log("🌱 Seeding database...");

        // 1. Create Users
        const hashedPassword = await bcrypt.hash("123456", 10);

        // Create Alumni
        const alumniRes = await pool.query(
            `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET name=$1 RETURNING id`,
            ["Dr. Sarah Chen", "sarah@example.com", hashedPassword, "ALUMNI"]
        );
        const alumniId = alumniRes.rows[0].id;
        console.log(`✅ Alumni created: Dr. Sarah Chen (ID: ${alumniId})`);

        // Create Student 1 (Alex)
        const student1Res = await pool.query(
            `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET name=$1 RETURNING id`,
            ["Alex Johnson", "alex@example.com", hashedPassword, "STUDENT"]
        );
        const student1Id = student1Res.rows[0].id;
        console.log(`✅ Student 1 created: Alex Johnson (ID: ${student1Id})`);

        // Create Student 2 (Sam)
        const student2Res = await pool.query(
            `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET name=$1 RETURNING id`,
            ["Sam Smith", "sam@example.com", hashedPassword, "STUDENT"]
        );
        const student2Id = student2Res.rows[0].id;
        console.log(`✅ Student 2 created: Sam Smith (ID: ${student2Id})`);

        // 2. Create Mentorship Requests

        // Request 1: Alex -> Sarah (PENDING)
        await pool.query(
            `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
       VALUES ($1, $2, $3, 'PENDING')`,
            [student1Id, alumniId, "Hi Dr. Chen, I'd love to learn about your research in AI."]
        );
        console.log("✅ Pending request created (Alex -> Sarah)");

        // Request 2: Sam -> Sarah (ACCEPTED)
        const request2Res = await pool.query(
            `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
       VALUES ($1, $2, $3, 'ACCEPTED') RETURNING id`,
            [student2Id, alumniId, "Can you mentor me on backend systems?"]
        );
        const mentorshipId = request2Res.rows[0].id;
        console.log("✅ Accepted request created (Sam -> Sarah)");

        // 3. Create Messages (for Accepted Chat)
        await pool.query(
            `INSERT INTO messages (mentorship_id, sender_id, message) VALUES 
       ($1, $2, 'Hi Sam, happy to help!'),
       ($1, $3, 'Thanks Dr. Chen! When can we meet?')`,
            [mentorshipId, alumniId, student2Id]
        );
        console.log("✅ Messages created between Sam and Sarah");

        // 4. Create Community Posts
        await pool.query(
            `INSERT INTO posts (user_id, content) VALUES 
       ($1, 'Hosting a webinar on AI this Friday! Join us.'),
       ($2, 'Looking for study partners for the Capstone project.')`,
            [alumniId, student1Id]
        );
        console.log("✅ Community posts created");

        console.log("\n🎉 Seeding complete! You can now log in.");
        console.log("Alumni Login: sarah@example.com / 123456");
        console.log("Student Login: alex@example.com / 123456");

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();
