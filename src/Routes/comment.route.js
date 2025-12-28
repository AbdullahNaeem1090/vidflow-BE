import express from "express";

import { createComment, deleteComment, getVideoComments, updateComment } from "../Controllers/comment.controller.js";
import { auth } from "../middlewares/auth.js";

const CommentRouter = express.Router();

CommentRouter.post("/", auth, createComment);
CommentRouter.get("/:videoId", getVideoComments);
CommentRouter.put("/:id", auth, updateComment);
CommentRouter.delete("/:id", auth, deleteComment);

export default CommentRouter;
