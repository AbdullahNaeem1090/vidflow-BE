import express from "express";
import { checkIfLiked, getLikeCount, toggleLike } from "../Controllers/like.controller.js";
import { auth } from "../Middlewares/auth.js";

const LikeRouter = express.Router();

LikeRouter.post("/toggle", auth, toggleLike);
LikeRouter.get("/count/:videoId", getLikeCount);
LikeRouter.get("/is-liked/:videoId", auth, checkIfLiked);

export default LikeRouter;
