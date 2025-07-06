import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
	try {
		const streamUpload = (fileBuffer) => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
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
};
