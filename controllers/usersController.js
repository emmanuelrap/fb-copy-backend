import pool from "../config/db.js";
import { mapUserFromDb } from "../models/userModel.js";

export const getUsers = async (req, res) => {
	console.log("[ejecución] getUsers()");
	try {
		const { rows } = await pool.query("SELECT * FROM users");

		res.json(rows);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const getUserWithPostsAndFriends = async (req, res) => {
	console.log("[ejecución] getUserWithPostsAndFriends()");
	try {
		const userid = parseInt(req.params.id);
		if (isNaN(userid)) return res.status(400).json({ message: "ID inválido" });

		// Obtener usuario
		const userRes = await pool.query(
			`SELECT id, username, email, full_name, avatar_url, cover_photo_url, created_at
       FROM users WHERE id = $1`,
			[userid]
		);
		const user = userRes.rows[0];
		if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

		// Obtener posts del usuario
		const postsRes = await pool.query(
			`SELECT id, userid, text_content, media_url, media_type, created_at
   FROM posts
   WHERE userid = $1
   ORDER BY id DESC`,
			[userid]
		);
		const posts = postsRes.rows;

		// todo Obtener amigos (amistades aceptadas)
		const sentRes = await pool.query(
			`SELECT u.id, u.full_name, u.username, u.avatar_url
       FROM friendships f
       JOIN users u ON f.addresseeid = u.id
       WHERE f.requesterid = $1 AND f.status = 'accepted'`,
			[userid]
		);

		// Amigos que recibieron la solicitud
		const receivedRes = await pool.query(
			`SELECT u.id, u.full_name, u.username, u.avatar_url
       FROM friendships f
       JOIN users u ON f.requesterid = u.id
       WHERE f.addresseeid = $1 AND f.status = 'accepted'`,
			[userid]
		);

		//const friends = [...sentRes.rows, ...receivedRes.rows];
		//TODO por el momento todos son amigos de todos
		const { rows: friends } = await pool.query("SELECT * FROM users");

		//agregar el nombre a los post
		posts.forEach((post) => {
			post.user = user;
		});

		res.json({
			...user,
			posts,
			friends,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const createUser = async (req, res) => {
	console.log("[ejecucion] createUser()", req.body);
	const { username, email, password, full_name, avatar_url, cover_photo_url } = req.body;

	try {
		const insertQuery = `
      INSERT INTO users (username, email, password, full_name, avatar_url, cover_photo_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;

		const values = [username, email, password, full_name, avatar_url, cover_photo_url];

		const { rows } = await pool.query(insertQuery, values);

		res.json(rows[0]);
	} catch (error) {
		console.error("Error creando usuario:", error);
		res.status(400).json({ error: error.message });
	}
};

export const authUser = async (req, res) => {
	console.log("[ejecución] authUser()");
	const { email, password, lastconnection } = req.body;

	try {
		const userRes = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
		const user = userRes.rows[0];
		if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

		if (user.password !== password) {
			return res.status(401).json({ error: "Contraseña incorrecta" });
		}

		// ✅ Actualizar isOnline y lastconnection
		const updateRes = await pool.query(
			`UPDATE users SET isonline = TRUE, lastconnection = $2 WHERE id = $1 
			 RETURNING id, username, full_name, avatar_url, cover_photo_url, isonline, lastconnection`,
			[user.id, lastconnection]
		);

		const updatedUser = updateRes.rows[0];

		res.json({
			message: "Autenticación exitosa",
			user: {
				id: updatedUser.id,
				email,
				username: updatedUser.username,
				full_name: updatedUser.full_name,
				avatar_url: updatedUser.avatar_url,
				cover_photo_url: updatedUser.cover_photo_url,
				isOnline: updatedUser.isonline,
				lastConnection: updatedUser.lastconnection,
			},
		});
	} catch (error) {
		console.error("Error en authUser:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const deleteUser = async (req, res) => {
	console.log("[ejecución] deleteUser()");
	const id = parseInt(req.params.id);
	if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

	try {
		const deleteRes = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);

		if (deleteRes.rowCount === 0) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}

		res.json({ message: "Usuario eliminado correctamente" });
	} catch (error) {
		console.error("Error eliminando usuario:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const logoutUser = async (req, res) => {
	const { email, lastConnection } = req.body;

	try {
		const userRes = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
		const user = userRes.rows[0];
		if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

		const updateRes = await pool.query(
			`UPDATE users SET isonline = FALSE, lastconnection = $1 WHERE id = $2 RETURNING id, username, full_name, avatar_url, cover_photo_url, isonline, lastconnection`,
			[lastConnection, user.id]
		);

		const updatedUser = updateRes.rows[0];

		res.json({
			message: "Sesión cerrada correctamente",
			user: {
				id: updatedUser.id,
				email,
				username: updatedUser.username,
				full_name: updatedUser.full_name,
				avatar_url: updatedUser.avatar_url,
				cover_photo_url: updatedUser.cover_photo_url,
				isOnline: updatedUser.isonline,
				lastConnection: updatedUser.lastconnection,
			},
		});
	} catch (error) {
		console.error("Error en logoutUser:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const updateUser = async (req, res) => {
	console.log("[ejecución] updateUser()");
	const userId = parseInt(req.params.id);
	if (isNaN(userId)) {
		return res.status(400).json({ error: "ID inválido" });
	}

	const allowedFields = ["username", "email", "full_name", "avatar_url", "cover_photo_url", "isonline"]; // campos permitidos
	const fieldsToUpdate = Object.entries(req.body).filter(([key]) => allowedFields.includes(key));

	if (fieldsToUpdate.length === 0) {
		return res.status(400).json({ error: "No hay campos válidos para actualizar" });
	}

	// Construir consulta dinámica
	const setClauses = fieldsToUpdate.map(([key], index) => `${key} = $${index + 1}`).join(", ");
	const values = fieldsToUpdate.map(([, value]) => value);

	try {
		const result = await pool.query(`UPDATE users SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`, [...values, userId]);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}

		res.json({ message: "Usuario actualizado correctamente", user: result.rows[0] });
	} catch (error) {
		console.error("Error actualizando usuario:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const pingUserConnection = async (req, res) => {
	console.log("[ejecución] pingUserConnection()");
	const { userid, lastconnection } = req.body;

	try {
		const updateRes = await pool.query(`UPDATE users SET isonline = TRUE, lastconnection = $2 WHERE id = $1 RETURNING id, isonline, lastconnection`, [userid, lastconnection]);
		const updatedUser = updateRes.rows[0];

		res.json({
			message: "Ping recibido",
			user: {
				id: updatedUser.id,
				isOnline: updatedUser.isonline,
				lastConnection: updatedUser.lastconnection,
			},
		});
	} catch (error) {
		console.error("Error en ping:", error);
		res.status(500).json({ error: "Error actualizando ping" });
	}
};
