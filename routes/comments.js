import express from "express";
import { getComments, createComment, deleteComment, updateComment } from "../controllers/commentsController.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", createComment);
router.delete("/:id", deleteComment);
router.patch("/:id", updateComment);

export default router;
