import express from "express";
import { getUsers, createUser, authUser, getUserWithPostsAndFriends, logoutUser, pingUserConnection, deleteUser } from "../controllers/usersController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserWithPostsAndFriends);
router.post("/", createUser);
router.post("/login", authUser);
router.post("/logout", logoutUser);
router.post("/ping", pingUserConnection);
router.delete("/:id", deleteUser);

export default router;
