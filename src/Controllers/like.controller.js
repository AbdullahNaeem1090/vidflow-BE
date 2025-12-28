import { likeModel } from "../Models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleLike = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const userId = req.user._id;

  const existing = await likeModel.findOne({ likedVideoId: videoId, likedById: userId });

  if (existing) {
    await likeModel.findByIdAndDelete(existing._id);
    return res.status(200).json({ success: true, liked: false });
  }

  const newLike = await likeModel.create({
    likedVideoId: videoId,
    likedById: userId,
  });

  return res.status(201).json({ success: true, liked: true, data: newLike });
});

export const getLikeCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const count = await likeModel.countDocuments({ likedVideoId: videoId });

  return res.status(200).json({ success: true, likes: count });
});

export const checkIfLiked = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const liked = await likeModel.findOne({
    likedVideoId: videoId,
    likedById: userId,
  });

  return res.status(200).json({ success: true, liked: !!liked });
});
