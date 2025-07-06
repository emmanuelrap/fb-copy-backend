import prisma from "../prisma/prismaClient.js";

export const getUsers = async (req, res) => {
	const users = await prisma.user.findMany();
	res.json(users);
};

export const getUserWithPostsAndFriends = async (req, res) => {
	console.log("getUserWithPostsAndFriends()");
	try {
		const userId = parseInt(req.params.id);

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				username: true,
				email: true,
				full_name: true,
				avatar_url: true,
				cover_photo_url: true,
				created_at: true,
				posts: {
					select: {
						id: true,
						text_content: true,
						media_url: true,
						media_type: true,
						created_at: true,
					},
				},
				friendshipsSent: {
					where: { status: "accepted" },
					select: {
						addressee: {
							select: {
								id: true,
								full_name: true,
								username: true,
								avatar_url: true,
							},
						},
					},
				},
				friendshipsReceived: {
					where: { status: "accepted" },
					select: {
						requester: {
							select: {
								id: true,
								full_name: true,
								username: true,
								avatar_url: true,
							},
						},
					},
				},
			},
		});

		if (!user) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}

		const friends = [...user.friendshipsSent.map((f) => f.addressee), ...user.friendshipsReceived.map((f) => f.requester)];

		res.json({
			...user,
			friendshipsSent: undefined,
			friendshipsReceived: undefined,
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
		const newUser = await prisma.user.create({
			data: { username, email, password, full_name, avatar_url, cover_photo_url },
		});
		res.json(newUser);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

export const authUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}

		if (user.password !== password) {
			return res.status(401).json({ error: "Contraseña incorrecta" });
		}

		// Aquí actualizamos isOnline a true
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: { isOnline: true },
		});

		// Opcional: puedes devolver solo lo necesario
		const { id, username, full_name, avatar_url, cover_photo_url, isOnline } = updatedUser;

		return res.json({
			message: "Autenticación exitosa",
			user: { id, email, username, full_name, avatar_url, cover_photo_url, isOnline },
		});
	} catch (error) {
		console.error("Error en authUser:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const deleteUser = async (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).json({ error: "ID inválido" });
	}

	try {
		// Intentar eliminar directamente:
		await prisma.user.delete({ where: { id } });
		return res.json({ message: "Usuario eliminado correctamente" });
	} catch (error) {
		// Si error es porque no encontró el usuario, responde 404
		if (error.code === "P2025") {
			// Código de Prisma para "Record to delete does not exist"
			return res.status(404).json({ error: "Usuario no encontrado" });
		}
		console.error("Error eliminando usuario:", error);
		return res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const logoutUser = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}

		// Actualizamos isOnline a false y lastConnection a ahora
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				isOnline: false,
				lastConnection: new Date(),
			},
		});

		const { id, username, full_name, avatar_url, cover_photo_url, isOnline, lastConnection } = updatedUser;

		return res.json({
			message: "Sesión cerrada correctamente",
			user: { id, email, username, full_name, avatar_url, cover_photo_url, isOnline, lastConnection },
		});
	} catch (error) {
		console.error("Error en logoutUser:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const pingUserConnection = async (req, res) => {
	const { userId } = req.body;

	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				isOnline: true,
				lastConnection: new Date(),
			},
		});

		return res.json({
			message: "Ping recibido",
			user: {
				id: updatedUser.id,
				isOnline: updatedUser.isOnline,
				lastConnection: updatedUser.lastConnection,
			},
		});
	} catch (error) {
		console.error("Error en ping:", error);
		return res.status(500).json({ error: "Error actualizando ping" });
	}
};
