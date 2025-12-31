import { watchHistoryModel } from "../Models/watchHistory.model.js";
import { timeAgo } from "../utils/videoControllerHelper.js";

export const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const addToWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id; // assuming auth middleware
    const { videoId } = req.body;

    // remove duplicate if exists
    await watchHistoryModel.deleteOne({ userId, videoId });

    const history = await watchHistoryModel.create({
      userId,
      videoId,
    });

    res.status(201).json({
      success: true,
      message: "Added to watch history",
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId } = req.params;

    await watchHistoryModel.deleteOne({ userId, videoId });

    res.json({
      success: true,
      message: "Removed from watch history",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    await watchHistoryModel.deleteMany({ userId });

    res.json({
      success: true,
      message: "Watch history cleared",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getWatchHistory = async (req, res) => {
  try {

    console.log("im called");
    

    const userId = req.user._id;

    const history = await watchHistoryModel
      .find({ userId })
      .populate({
        path: "videoId",
        populate: {
          path: "owner",
          select: "username",
        },
      })
      .sort({ createdAt: -1 });

    const formattedHistory = history.map((item) => ({
      id: item.videoId._id,
      title: item.videoId.title,
      thumbnail: item.videoId.thumbnail,
      duration: formatDuration(item.videoId.duration),
      watchedAt: timeAgo(item.watchedAt),
      channelName: item.videoId.owner.username,
      viewCount: item.videoId.views.toString(),
    }));

    res.json({
      success: true,
      data: formattedHistory,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ success: false, message: error.message });
  }
};
