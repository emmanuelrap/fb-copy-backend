import pool from "../config/db.js";

export const getFriendships = async (req, res) => {
	try {
		const friendshipsRes = await pool.query(`
			SELECT f.id, f.requester AS requester_id, f.addressee AS addressee_id, f.status, f.created_at,
				   r.full_name AS requester_name, r.avatar_url AS requester_avatar,
				   a.full_name AS addressee_name, a.avatar_url AS addressee_avatar
			FROM friendships f
			JOIN users r ON f.requester = r.id
			JOIN users a ON f.addressee = a.id
			ORDER BY f.created_at DESC
		`);

		const friendships = friendshipsRes.rows.map((f) => ({
			id: f.id,
			status: f.status,
			created_at: f.created_at,
			requester: {
				id: f.requester_id,
				full_name: f.requester_name,
				avatar_url: f.requester_avatar,
			},
			addressee: {
				id: f.addressee_id,
				full_name: f.addressee_name,
				avatar_url: f.addressee_avatar,
			},
		}));

		res.json(friendships);
	} catch (error) {
		console.error("Error fetching friendships:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const sendRequest = async (req, res) => {
	console.log("[ejecucion] sendRequest()", req.body);
	const { requesterId, addresseeId } = req.body;

	try {
		const insertQuery = `
			INSERT INTO friendships (requester, addressee, status, created_at)
			VALUES ($1, $2, 'pending', NOW())
			RETURNING *;
		`;

		const values = [requesterId, addresseeId];
		const { rows } = await pool.query(insertQuery, values);

		res.status(201).json(rows[0]);
	} catch (error) {
		console.error("Error enviando solicitud de amistad:", error);
		res.status(400).json({ error: error.message });
	}
};
