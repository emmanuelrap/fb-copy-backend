import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentsRoutes from "./routes/comments.js";
import friendshipsRoutes from "./routes/friendships.js";
import likesRoutes from "./routes/likes.js";
import uploadRoute from "./routes/uploadCloudinary.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/friendships", friendshipsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/upload", uploadRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
