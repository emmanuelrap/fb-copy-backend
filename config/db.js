import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

console.log("DATABASE_URL desde db.js:", process.env.DATABASE_URL); // 👈

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export default pool;
