import express from "express";
import upload from "../middleware/multer.js";
import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";

const router = express.Router();

router.post("/image/:id", upload.single("image"), async (req, res) => {
	console.log("[ejecución] upload/image...");
	const userId = parseInt(req.params.id);

	if (isNaN(userId)) {
		return res.status(400).json({ error: "ID inválido" });
	}
	try {
		//obtener el usuario
		const { rows } = await pool.query("SELECT full_name FROM users WHERE id = $1", [userId]);
		if (rows.length === 0) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}
		const fullName = rows[0].full_name;

		const streamUpload = (fileBuffer) => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream({ resource_type: "image", folder: `fb/users/${userId}-${fullName}` }, (error, result) => {
					if (result) resolve(result);
					else reject(error);
				});
				stream.end(fileBuffer);
			});
		};

		const result = await streamUpload(req.file.buffer);
		res.json({
			url: result.secure_url,
			public_id: result.public_id,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Upload failed" });
	}
});

router.post("/video", upload.single("video"), async (req, res) => {
	console.log("[ejecución] upload/video (post)");
	try {
		const streamUpload = (fileBuffer) => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{ resource_type: "video", folder: "fb/posts/videos" }, // 👈 importante para videos
					(error, result) => {
						if (result) resolve(result);
						else reject(error);
					}
				);
				stream.end(fileBuffer);
			});
		};

		const result = await streamUpload(req.file.buffer);

		res.json({
			url: result.secure_url,
			public_id: result.public_id,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Upload failed" });
	}
});

export default router;
