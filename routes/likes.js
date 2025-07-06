import express from "express";
import { toggleLike } from "../controllers/likesController.js";

const router = express.Router();

router.post("/", toggleLike);

export default router;
