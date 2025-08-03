import pool from "../config/db.js";

export const getPostById = async (req, res) => {
	console.log("[ejecución] getPostById()");
	const { id } = req.params;

	try {
		const postRes = await pool.query(
			`
			SELECT 
				p.id, p.userid, p.text_content, p.media_url, p.media_type, p.created_at,
				u.full_name AS user_full_name, u.avatar_url AS user_avatar_url
			FROM posts p
			JOIN users u ON p.userid = u.id
			WHERE p.id = $1
		`,
			[id]
		);

		if (postRes.rows.length === 0) {
			return res.status(404).json({ error: "Post no encontrado" });
		}

		const post = postRes.rows[0];

		// Obtener likes
		const likesRes = await pool.query(
			`
			SELECT l.id, l.postid, l.userid, l.created_at, u.full_name, u.avatar_url
			FROM likes l
			JOIN users u ON l.userid = u.id
			WHERE l.postid = $1
		`,
			[id]
		);
		post.likes = likesRes.rows;

		// Obtener comentarios
		const commentsRes = await pool.query(
			`
			SELECT c.id, c.content, c.userid, u.full_name, u.avatar_url, c.created_at
			FROM comments c
			JOIN users u ON c.userid = u.id
			WHERE c.postid = $1
			ORDER BY c.created_at ASC
		`,
			[id]
		);
		post.comments = commentsRes.rows;

		post.likesCount = post.likes.length;
		post.commentsCount = post.comments.length;

		post.user = {
			id: post.userid,
			full_name: post.user_full_name,
			avatar_url: post.user_avatar_url,
		};

		delete post.userid;
		delete post.user_full_name;
		delete post.user_avatar_url;

		res.json(post);
	} catch (error) {
		console.error("Error al obtener el post:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const getAllPosts = async (req, res) => {
	console.log("[ejecución] getAllPosts()");
	try {
		const postsRes = await pool.query(`
			SELECT 
				p.id, p.userid, p.text_content, p.media_url, p.media_type, p.created_at,
				u.full_name AS user_full_name, u.avatar_url AS user_avatar_url
			FROM posts p
			JOIN users u ON p.userid = u.id
			ORDER BY p.created_at DESC
		`);
		const posts = postsRes.rows;

		// Para cada post, obtener likes y comments
		for (const post of posts) {
			const likesRes = await pool.query(
				`
				SELECT l.id, l.postid, l.userid,l.created_at, u.full_name, u.avatar_url
				FROM likes l
				JOIN users u ON l.userid = u.id
				WHERE l.postid = $1
			`,
				[post.id]
			);
			post.likes = likesRes.rows;

			const commentsRes = await pool.query(
				`
				SELECT c.id, c.content, c.userid, u.full_name, u.avatar_url, c.created_at
				FROM comments c
				JOIN users u ON c.userid = u.id
				WHERE c.postid = $1
				ORDER BY c.created_at ASC
			`,
				[post.id]
			);
			post.comments = commentsRes.rows;

			//contamos los likes y los comentarios para no hacerlo en el front
			post.likesCount = post.likes.length;
			post.commentsCount = post.comments.length;

			// Agrupa la info del usuario
			post.user = {
				id: post.userid,
				full_name: post.user_full_name,
				avatar_url: post.user_avatar_url,
			};

			// Limpia campos redundantes
			delete post.userid;
			delete post.user_full_name;
			delete post.user_avatar_url;
		}

		res.json(posts);
	} catch (error) {
		console.error("Error fetching posts:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const getPostsPaginated = async (req, res) => {
	console.log("[ejecución] getPostsPaginated()");
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const offset = (page - 1) * limit;

		const postsRes = await pool.query(
			`
			SELECT 
				p.id, p.userid, p.text_content, p.media_url, p.media_type, p.created_at,
				u.full_name AS user_full_name, u.avatar_url AS user_avatar_url
			FROM posts p
			JOIN users u ON p.userid = u.id
			ORDER BY p.created_at DESC
			LIMIT $1 OFFSET $2
		`,
			[limit, offset]
		);

		const posts = postsRes.rows;

		for (const post of posts) {
			const likesRes = await pool.query(
				`
				SELECT l.id, l.postid, l.userid,l.created_at, u.full_name, u.avatar_url
				FROM likes l
				JOIN users u ON l.userid = u.id
				WHERE l.postid = $1
			`,
				[post.id]
			);
			post.likes = likesRes.rows;

			const commentsRes = await pool.query(
				`
				SELECT c.id, c.content, c.userid, u.full_name, u.avatar_url, c.created_at
				FROM comments c
				JOIN users u ON c.userid = u.id
				WHERE c.postid = $1
				ORDER BY c.created_at ASC
			`,
				[post.id]
			);
			post.comments = commentsRes.rows;

			//contamos los likes y los comentarios para no hacerlo en el front
			post.likesCount = post.likes.length;
			post.commentsCount = post.comments.length;

			post.user = {
				id: post.userid,
				full_name: post.user_full_name,
				avatar_url: post.user_avatar_url,
			};
			delete post.userid;
			delete post.user_full_name;
			delete post.user_avatar_url;
		}

		res.json(posts);
	} catch (error) {
		console.error("Error fetching paginated posts:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const createPost = async (req, res) => {
	console.log("[ejecucion] createPost()", req.body);
	const { userid, text_content, media_url, media_type } = req.body;

	try {
		const insertQuery = `
			INSERT INTO posts (userid, text_content, media_url, media_type, created_at)
			VALUES ($1, $2, $3, $4, NOW())
			RETURNING *;
		`;

		const values = [userid, text_content, media_url, media_type];

		const { rows } = await pool.query(insertQuery, values);

		res.status(201).json(rows[0]);
	} catch (error) {
		console.error("Error creando post:", error);
		res.status(400).json({ error: error.message });
	}
};

export const deletePost = async (req, res) => {
	console.log("[ejecución] deletePost()");
	const { id } = req.params;

	try {
		const deleteQuery = `
			DELETE FROM posts
			WHERE id = $1 RETURNING *;
		`;
		const { rows } = await pool.query(deleteQuery, [id]);

		if (rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "post no encontrado",
			});
		}

		res.json({
			success: true,
			message: "post eliminado correctamente",
			post: rows[0],
		});
	} catch (error) {
		console.error("Error eliminando post:", error);
		res.status(500).json({
			success: false,
			error: "Error interno del servidor",
		});
	}
};
