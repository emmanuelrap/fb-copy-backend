import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
	storage,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50 MB
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/ogg"];
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Tipo de archivo no permitido. Solo se permiten videos."), false);
		}
	},
});

export default upload;
