const db = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
  const hashed = await bcrypt.hash("123456", 10);

  db.serialize(() => {
    console.log("🌱 Seeding database...");

    // USERS
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Alex Johnson", "alex@example.com", hashed, "student"]
    );

    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Dr. Sarah Chen", "sarah@example.com", hashed, "alumni"]
    );

    // MENTORSHIP REQUEST
    db.run(
      `INSERT INTO mentorship_requests (student_id, alumni_id, message, status)
   VALUES (?, ?, ?, ?)`,
      [1, 2, "Need guidance", "ACCEPTED"]
    )

    // MESSAGES (chat)
    db.run(
      "INSERT INTO messages (mentorship_id, sender_id, message) VALUES (?, ?, ?)",
      [1, 1, "Hello ma’am!"]
    );

    db.run(
      "INSERT INTO messages (mentorship_id, sender_id, message) VALUES (?, ?, ?)",
      [1, 2, "Hi Alex, happy to help!"]
    );

    // POSTS (community)
    db.run(
      "INSERT INTO posts (user_id, content) VALUES (?, ?)",
      [2, "Welcome to AlumniConnect!"]
    );

    db.run(
      "INSERT INTO posts (user_id, content) VALUES (?, ?)",
      [1, "Excited to connect with alumni!"]
    );

    console.log("✅ Full data seeded");
  });
}

seed();