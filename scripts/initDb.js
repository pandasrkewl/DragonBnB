const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const sqlPath = path.join(__dirname, "../sql/schema.sql");
    const schema = fs.readFileSync(sqlPath, "utf8");

    await client.query(schema);
    console.log("Database tables created successfully!");
  } catch (err) {
    if (err.code === "42P07") {
      // PostgreSQL error code for "duplicate database"
      console.log("One or more tables already exists.");
    } else {
      console.error("Error creating database tables:", err.message);
    }
  } finally {
    await client.end();
  }
}

initializeDatabase();