const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
        console.error("❌ DB Error:", err);
    } else {
        console.log("✅ SQLite Connected");
    }
});

module.exports = db;