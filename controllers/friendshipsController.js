import prisma from "../prisma/prismaClient.js";

export const getFriendships = async (req, res) => {
	const friendships = await prisma.friendship.findMany();
	res.json(friendships);
};

export const sendRequest = async (req, res) => {
	const { requesterId, addresseeId } = req.body;
	try {
		const friendship = await prisma.friendship.create({
			data: { requesterId, addresseeId },
		});
		res.status(201).json(friendship);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};
