import { commentModel } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const createComment = asyncHandler(async (req, res) => {
  const { videoId, comment } = req.body;
  const userId = req.user._id;

  if (!videoId || !comment) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const newComment = await commentModel.create({
    author: userId,
    Commented_Video_id: videoId,
    comment,
  });

  return res.status(201).json({ success: true, data: newComment });
});


export const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const comments = await commentModel
    .find({ Commented_Video_id: videoId })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });

  const formattedComments = comments.map((c) => ({
    id: c._id,
    author: c.author.username,
    avatar: c.author.avatar,
    time: c.createdAt.toISOString(), // or format it
    text: c.comment,
  }));

  return res.status(200).json({
    success: true,
    data: formattedComments,
  });
});



export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userId = req.user._id;

  const existing = await commentModel.findById(id);

  if (!existing) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  if (existing.author.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  existing.comment = comment;
  await existing.save();

  return res.status(200).json({ success: true, data: existing });
});


export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const existing = await commentModel.findById(id);

  if (!existing) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  if (existing.author.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  await commentModel.findByIdAndDelete(id);

  return res.status(200).json({ success: true, message: "Comment deleted" });
});
