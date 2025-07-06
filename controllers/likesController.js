import prisma from "../prisma/prismaClient.js";

export const toggleLike = async (req, res) => {
	const { postId, userId } = req.body;

	try {
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});

		if (existingLike) {
			// Si ya existe el like, lo borramos (unlike)
			await prisma.like.delete({
				where: { id: existingLike.id },
			});

			return res.status(200).json({
				success: true,
				like: null,
				message: "Like removido",
			});
		}

		// Si no existe, creamos el like y traemos datos del usuario
		const like = await prisma.like.create({
			data: {
				post: { connect: { id: postId } },
				user: { connect: { id: userId } },
			},
			include: {
				user: {
					select: {
						id: true,
						full_name: true,
						avatar_url: true,
					},
				},
			},
		});

		return res.status(201).json({
			success: true,
			like,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			error: "Ocurrió un error al procesar el like",
		});
	}
};
