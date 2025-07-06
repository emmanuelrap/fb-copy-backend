import express from "express";
import { getAllPosts, createPost, getPostsPaginated } from "../controllers/postsController.js";

const router = express.Router();

router.get("/all", getAllPosts);
router.get("/", getPostsPaginated);
router.post("/", createPost);

export default router;
