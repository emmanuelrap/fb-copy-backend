import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";

import { setupSocket } from "./socket/index.js"; // 👈 importar lógica socket

// Rutas
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentsRoutes from "./routes/comments.js";
import friendshipsRoutes from "./routes/friendships.js";
import likesRoutes from "./routes/likes.js";
import uploadRoute from "./routes/uploadCloudinary.js";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

setupSocket(io); // 👈 conectar sockets

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/friendships", friendshipsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/upload", uploadRoute);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
