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
	const { postid, userid, content, media_url } = req.body;

	try {
		const insertQuery = `
			INSERT INTO comments (postid, userid, content, media_url, created_at)
			VALUES ($1, $2, $3, $4, NOW())
			RETURNING *;
		`;

		const values = [postid, userid, content, media_url];
		const { rows } = await pool.query(insertQuery, values);

		const comment = rows[0];

		// Obtener datos del usuario
		const userRes = await pool.query(
			`
			SELECT full_name AS user_full_name, avatar_url AS user_avatar_url
			FROM users 
			WHERE id = $1
			`,
			[userid]
		);

		const user = userRes.rows[0];

		const enrichedComment = {
			avatar_url: user.user_avatar_url,
			content: comment.content,
			created_at: comment.created_at,
			full_name: user.user_full_name,
			id: comment.id,
			postid: postid,
			userid: userid,
			//media_url: comment.media_url,
		};

		res.status(201).json({
			success: true,
			message: "Comentario creado correctamente",
			comment: enrichedComment,
		});
	} catch (error) {
		console.error("Error creando comentario:", error);
		res.status(400).json({
			success: false,
			error: error.message,
		});
	}
};

export const deleteComment = async (req, res) => {
	const { id } = req.params;

	try {
		const deleteQuery = `DELETE FROM comments WHERE id = $1 RETURNING *;`;
		const { rows } = await pool.query(deleteQuery, [id]);

		if (rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Comentario no encontrado",
			});
		}

		res.json({
			success: true,
			message: "Comentario eliminado correctamente",
			comment: rows[0],
		});
	} catch (error) {
		console.error("Error eliminando comentario:", error);
		res.status(500).json({
			success: false,
			error: "Error interno del servidor",
		});
	}
};

// Actualizar parcialmente un comentario (PATCH)
export const updateComment = async (req, res) => {
	const { id } = req.params; // ID del comentario a actualizar
	const { content, media_url } = req.body; // campos que se pueden actualizar

	try {
		// Armar dinámicamente el query para actualizar solo los campos que vienen
		const fields = [];
		const values = [];
		let idx = 1;

		if (content !== undefined) {
			fields.push(`content = $${idx++}`);
			values.push(content);
		}

		if (media_url !== undefined) {
			fields.push(`media_url = $${idx++}`);
			values.push(media_url);
		}

		if (fields.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No se proporcionaron campos para actualizar",
			});
		}

		// Agregar el ID para el WHERE
		values.push(id);

		const updateQuery = `
			UPDATE comments
			SET ${fields.join(", ")}
			WHERE id = $${idx}
			RETURNING *;
		`;

		const { rows } = await pool.query(updateQuery, values);

		if (rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Comentario no encontrado",
			});
		}

		res.json({
			success: true,
			message: "Comentario actualizado correctamente",
			comment: rows[0],
		});
	} catch (error) {
		console.error("Error actualizando comentario:", error);
		res.status(500).json({
			success: false,
			error: "Error interno del servidor",
		});
	}
};
