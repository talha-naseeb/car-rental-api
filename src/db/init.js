const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME, // Just for connection setup if needed later, but createConnection ignores it usually if not specified
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  multipleStatements: true,
};

async function initDatabase() {
  let connection;
  try {
    // 1. Connect without database to create it if needed
    const { database, ...connectConfig } = dbConfig;
    console.log("Connecting to MySQL server...", { host: connectConfig.host, port: connectConfig.port });
    connection = await mysql.createConnection(connectConfig);

    const dbName = process.env.DB_NAME || "car_rental_db";
    console.log(`Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    // 2. Read schema.sql
    console.log("Reading schema.sql...");
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // 3. Execute schema
    console.log("Executing schema and seeding data...");
    await connection.query(schemaSql);

    console.log("Database initialization completed successfully!");
    console.log("Mock data has been inserted.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
