import express from "express";
import { getAllPosts, createPost, getPostsPaginated, deletePost, getPostById } from "../controllers/postsController.js";

const router = express.Router();

router.get("/one/:id", getPostById);
router.get("/all", getAllPosts);
router.get("/", getPostsPaginated);
router.post("/", createPost);
router.delete("/:id", deletePost);

export default router;
