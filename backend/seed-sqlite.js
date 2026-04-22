const db = require("./db");
const bcrypt = require("bcrypt");

async function seed() {
  const hashed = await bcrypt.hash("123456", 10);

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Alex Johnson", "alex@example.com", hashed, "student"]
  );

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Dr. Sarah Chen", "sarah@example.com", hashed, "alumni"]
  );

  console.log("✅ Users seeded");
}

seed();