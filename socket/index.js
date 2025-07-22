import pool from "../config/db.js";

export const setupSocket = (io) => {
	io.on("connection", async (socket) => {
		const userId = socket.handshake.query.userId;
		const userName = socket.handshake.query.userName;

		if (!userId) {
			console.log("Conexión sin userId, desconectando...");
			socket.disconnect();
			return;
		}

		// Actualiza BD: usuario online
		try {
			await pool.query("UPDATE users SET isonline = true WHERE id = $1", [userId]);
			console.log(`${userName} (ID: ${userId}) conectado y marcado como online`);
		} catch (error) {
			console.error("Error actualizando isonline al conectar:", error);
		}

		// Emitir a todos el usuario conectado (puedes enviar solo ID y nombre)
		io.emit("user-status-changed", { userId, userName, isonline: true });

		socket.on("disconnect", async () => {
			try {
				await pool.query("UPDATE users SET isonline = false, lastconnection = NOW() WHERE id = $1", [userId]);
				console.log(`${userName} (ID: ${userId}) desconectado y marcado como offline`);
			} catch (error) {
				console.error("Error actualizando isonline al desconectar:", error);
			}

			io.emit("user-status-changed", { userId, userName, isonline: false });
		});
	});
};
