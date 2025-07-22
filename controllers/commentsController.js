import pool from "../config/db.js";

export const getComments = async (req, res) => {
	try {
		const commentsRes = await pool.query(`
			SELECT c.id, c.postid AS post_id, c.user AS userid, c.content, c.media_url, c.created_at,
				   u.full_name AS user_full_name, u.avatar_url AS user_avatar_url
			FROM comments c
			JOIN users u ON c.user = u.id
			ORDER BY c.created_at ASC
		`);

		const comments = commentsRes.rows.map((comment) => ({
			id: comment.id,
			postId: comment.post_id,
			user: {
				id: comment.userid,
				full_name: comment.user_full_name,
				avatar_url: comment.user_avatar_url,
			},
			content: comment.content,
			media_url: comment.media_url,
			created_at: comment.created_at,
		}));

		res.json(comments);
	} catch (error) {
		console.error("Error fetching comments:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const createComment = async (req, res) => {
	console.log("[ejecucion] createComment()", req.body);
	const { postId, userId, content, media_url } = req.body;

	try {
		const insertQuery = `
			INSERT INTO comments (post, user, content, media_url, created_at)
			VALUES ($1, $2, $3, $4, NOW())
			RETURNING *;
		`;

		const values = [postId, userId, content, media_url];
		const { rows } = await pool.query(insertQuery, values);

		const comment = rows[0];

		res.status(201).json({
			success: true,
			message: "Comentario creado correctamente",
			comment,
		});
	} catch (error) {
		console.error("Error creando comentario:", error);
		res.status(400).json({
			success: false,
			error: error.message,
		});
	}
};
