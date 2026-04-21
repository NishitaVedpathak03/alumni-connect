const pool = require("./db");

async function checkTables() {
    try {
        console.log("🔍 Checking database tables in 'capstone2026'...");

        const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        if (res.rows.length === 0) {
            console.log("⚠️ No tables found in public schema.");
        } else {
            console.log("✅ Tables found:");
            res.rows.forEach(row => {
                console.log(` - ${row.table_name}`);
            });
        }

        // Also count rows in each to be helpful
        for (const row of res.rows) {
            const countRes = await pool.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
            console.log(`   └─ Rows: ${countRes.rows[0].count}`);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error checking tables:", err);
        process.exit(1);
    }
}

checkTables();
