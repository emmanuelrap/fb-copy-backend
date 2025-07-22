import pool from "../config/db.js";

export const toggleLike = async (req, res) => {
	const { postid, userid } = req.body;

	try {
		// Buscar si ya existe el like
		const existingLikeRes = await pool.query(`SELECT * FROM likes WHERE userid = $1 AND postid = $2`, [userid, postid]);

		if (existingLikeRes.rowCount > 0) {
			// Si ya existe, eliminamos el like
			await pool.query(`DELETE FROM likes WHERE userid = $1 AND postid = $2`, [userid, postid]);

			return res.status(200).json({
				success: true,
				like: null,
				message: "Like removido",
			});
		}

		// Si no existe, insertamos el like
		const insertRes = await pool.query(
			`INSERT INTO likes (userid, postid, created_at)
			 VALUES ($1, $2, NOW())
			 RETURNING *`,
			[userid, postid]
		);

		const like = insertRes.rows[0];

		// Traemos datos del usuario para el like
		const userRes = await pool.query(`SELECT id, full_name, avatar_url FROM users WHERE id = $1`, [userid]);
		const user = userRes.rows[0];

		return res.status(201).json({
			success: true,
			like: {
				id: like.id,
				postid: like.postid,
				userid: like.userid,
				created_at: like.created_at,
				full_name: user.full_name,
				avatar_url: user.avatar_url,
			},
			message: "Like agregado",
		});
	} catch (error) {
		console.error("Error en toggleLike:", error);
		return res.status(500).json({
			success: false,
			error: "Ocurrió un error al procesar el like",
		});
	}
};
