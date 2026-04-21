const pool = require("./db");

async function migrate() {
    try {
        console.log("🛠️ Starting database migration (UUID Mode)...");

        // 0. Verify users table ID type (to be safe, though error confirmed UUID)
        // We assume users table exists and id is UUID based on previous error.

        // 1. Drop tables if they exist to allow clean recreation with correct types
        // WARNING: flushing data, but necessary to fix schema mismatch if partial creation occurred
        await pool.query(`DROP TABLE IF EXISTS messages CASCADE;`);
        await pool.query(`DROP TABLE IF EXISTS posts CASCADE;`);
        await pool.query(`DROP TABLE IF EXISTS mentorship_requests CASCADE;`);
        await pool.query(`DROP TABLE IF EXISTS alumni_profiles CASCADE;`);

        console.log("🧹 Cleaned up old tables.");

        // 2. Mentorship Requests Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS mentorship_requests (
        id SERIAL PRIMARY KEY,
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        alumni_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Mentorship Requests table created.");

        // 3. Messages Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        mentorship_id INTEGER REFERENCES mentorship_requests(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Messages table created.");

        // 4. Posts Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Posts table created.");

        // 5. Alumni Profiles
        await pool.query(`
      CREATE TABLE IF NOT EXISTS alumni_profiles (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        company VARCHAR(255),
        job_title VARCHAR(255),
        graduation_year INTEGER,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Alumni Profiles table created.");

        console.log("\n🎉 Migration complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
