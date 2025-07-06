import prisma from "../prisma/prismaClient.js";

export const getComments = async (req, res) => {
	const comments = await prisma.comment.findMany();
	res.json(comments);
};

export const createComment = async (req, res) => {
	console.log("createComment");
	const { postId, userId, content, media_url } = req.body;
	try {
		const comment = await prisma.comment.create({
			data: { postId, userId, content, media_url },
		});
		res.status(201).json({
			success: true,
			message: "Comentario creado correctamente",
			comment,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
			error: err.message,
		});
	}
};
