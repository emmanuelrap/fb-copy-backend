import express from "express";
import { getFriendships, sendRequest } from "../controllers/friendshipsController.js";

const router = express.Router();

router.get("/", getFriendships);
router.post("/", sendRequest);

export default router;
