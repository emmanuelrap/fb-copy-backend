import prisma from "../prisma/prismaClient.js";

export const getAllPosts = async (req, res) => {
	try {
		const posts = await prisma.post.findMany({
			include: {
				user: {
					select: {
						id: true,
						full_name: true,
						avatar_url: true,
					},
				},
				likes: {
					include: {
						user: {
							select: {
								id: true,
								full_name: true,
								avatar_url: true,
							},
						},
					},
				},
				comments: {
					include: {
						user: {
							select: {
								id: true,
								full_name: true,
								avatar_url: true,
							},
						},
					},
				},
			},
		});

		res.json(posts);
	} catch (error) {
		console.error("Error fetching posts:", error);
		res.status(500).json({ error: "Error fetching posts" });
	}
};

export const getPostsPaginated = async (req, res) => {
	try {
		// Parámetros de query, con valores por defecto
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;

		// Cálculo de skip
		const skip = (page - 1) * limit;

		const posts = await prisma.post.findMany({
			skip,
			take: limit,
			include: {
				user: {
					select: {
						id: true,
						full_name: true,
						avatar_url: true,
					},
				},
				likes: {
					include: {
						user: {
							select: {
								id: true,
								full_name: true,
								avatar_url: true,
							},
						},
					},
				},
				comments: {
					include: {
						user: {
							select: {
								id: true,
								full_name: true,
								avatar_url: true,
							},
						},
					},
				},
			},
		});

		res.json(posts);
	} catch (error) {
		console.error("Error fetching paginated posts:", error);
		res.status(500).json({ error: "Error fetching posts" });
	}
};

export const createPost = async (req, res) => {
	console.log("[ejecucion] createPost()");
	const { userId, text_content, media_url, media_type } = req.body;
	try {
		const post = await prisma.post.create({
			data: { userId, text_content, media_url, media_type },
		});
		res.status(201).json(post);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};
