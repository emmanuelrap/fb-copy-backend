import pool from "./config/db.js";

async function testConnection() {
	try {
		const res = await pool.query("SELECT NOW()");
		console.log("Conexión exitosa:", res.rows[0]);
		process.exit(0);
	} catch (error) {
		console.error("Error conectando a la DB:", error);
		process.exit(1);
	}
}

testConnection();
