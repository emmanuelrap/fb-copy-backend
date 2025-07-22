// backend/models/userModel.js
export const mapUserFromDb = (dbUser) => {
	return {
		id: dbUser.id,
		username: dbUser.username,
		email: dbUser.email,
		fullName: dbUser.full_name,
		avatarUrl: dbUser.avatar_url,
		coverPhotoUrl: dbUser.cover_photo_url,
		isOnline: dbUser.isonline,
		lastConnection: dbUser.lastconnection,
		createdAt: dbUser.created_at,
	};
};
