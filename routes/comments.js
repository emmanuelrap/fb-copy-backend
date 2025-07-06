import express from "express";
import { getComments, createComment } from "../controllers/commentsController.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", createComment);

export default router;
