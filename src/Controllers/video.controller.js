import { asyncHandler } from "../utils/asyncHandler.js";
import { videoModel } from "../Models/video.model.js";
import { userModel } from "../Models/user.model.js";
import { likeModel } from "../Models/like.model.js";
import { subscriptionModel } from "../Models/subscription.model.js";
import { formatDuration, formatViews, timeAgo } from "../utils/videoControllerHelper.js";
import mongoose from "mongoose";
import { PlaylistModel } from "../Models/playlist.model.js";

const saveVideo = asyncHandler(async (req, res) => {
  const { title, description, videoURL, thumbnail, duration } = req.body;
  const owner = req.user._id;


  if (!owner || !title || !videoURL || !thumbnail) {
    return res.status(400).json({
      message: "Required fields are missing",
      success: false,
    });
  }

  if (
    [title, videoURL, thumbnail].some(
      (field) => typeof field !== "string" || field.trim() === ""
    )
  ) {
    return res.status(400).json({
      message: "Title, videoURL, thumbnail must NOT be empty",
      success: false,
    });
  }

  
  if (duration === undefined || duration === null || isNaN(duration)) {
    return res.status(400).json({
      message: "Video duration missing or invalid",
      success: false,
    });
  }

  const creatingVideoDoc = await videoModel.create({
    owner,
    title: title.trim(),
    videoURL: videoURL.trim(),
    thumbnail: thumbnail.trim(),
    duration,
    description: description?.trim() || "",
  });

  return res.status(200).json({
    message: "Video Uploaded Successfully",
    success: true,
    data: creatingVideoDoc,
  });
});

const getVideos = asyncHandler(async (req, res) => {
  
  let { lastVideoId } = req.params;
  if (!lastVideoId) lastVideoId = "000000000000000000000000";

  let objId;
  try {
    objId = new mongoose.Types.ObjectId(lastVideoId);
  } catch {
    objId = new mongoose.Types.ObjectId("000000000000000000000000");
  }

  const limit = 9;

  const videos = await videoModel.aggregate([
    {
      $match: { _id: { $gt: objId } }
    },
    {
      $sort: { _id: 1 }   // IMPORTANT for consistent cursor pagination
    },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
        pipeline: [
          { $project: { username: 1, avatar: 1 } } // FIXED
        ]
      }
    },
    { $unwind: "$user" },
  ]);

  const formattedVideos = videos.map((v) => ({
    id: v._id,
    thumbnail: v.thumbnail,
    duration: formatDuration(v.duration),
    title: v.title,
    channel: v.user.username,
    channelPic: v.user.avatar, // now it works
    views: formatViews(v.views || 0),
    timeAgo: timeAgo(v.createdAt),
  }));

  const nextCursor = videos.length ? videos[videos.length - 1]._id : null;

  return res.status(200).json({
    success: true,
    data: {
      videos: formattedVideos,
      nextCursor,
    },
  });
});


export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user?._id

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json({ message: "Invalid video id" })
  }

  // ---- FIND VIDEO ----
  const video = await videoModel.findById(videoId)
  if (!video) {
    return res.status(404).json({ message: "Video not found" })
  }

  // ---- OWNER CHECK ----
  if (video.owner.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Not authorized" })
  }

  // ---- REMOVE FROM PLAYLISTS ----
  await PlaylistModel.updateMany(
    { videos: videoId },
    { $pull: { videos: videoId } }
  )

  // ---- DELETE VIDEO ----
  await videoModel.findByIdAndDelete(videoId)

  return res.status(200).json({
    success: true,
    message: "Video deleted successfully",
  })
})



const PlayingVideoData = asyncHandler(async (req, res) => {
    const videoId = req.params.id
    const userId = req.user?._id  

    // ------- FETCH VIDEO -------
    const video = await videoModel.findById(videoId).populate("owner")
    if (!video) return res.status(404).json({ message: "Video not found" })

    // ------- VIEWS LOGIC -------
    video.views += 1
    await video.save()

    // ------- LIKE COUNT -------
    const likes = await likeModel.countDocuments({
      likedVideoId: videoId
    })

    // ------- CHANNEL INFO -------
    const channel = await userModel.findById(video.owner._id)

    const subscriberCount = await subscriptionModel.countDocuments({
      subscribedTo: channel._id
    })

    const isSubscribed = userId
      ? await subscriptionModel.exists({
          subscriber: userId,
          subscribedTo: channel._id
        })
      : false

    // ------- FINAL RESPONSE -------
    return res.status(200).json({
      success:true,
      data:{
      src: video.videoURL,
      thumbnail: video.thumbnail,
      title: video.title,
      views: video.views,
      uploadedAt: timeAgo(video.createdAt),
      likes,
      description: video.description,
      channel: {
        id: channel._id,
        name: channel.username,
        avatar: channel.avatar,
        subscribers: subscriberCount,
        isSubscribed: Boolean(isSubscribed),
      },
    }})
  }
 )

// Get search suggestions (autocomplete)
 const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    const searchRegex = new RegExp(query.trim(), "i");

    // Search videos (limit 5)
    const videos = await videoModel
      .find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      })
      .select("title thumbnail views")
      .populate("owner", "username avatar")
      .limit(5)
      .lean();

    // Search users/channels (limit 5)
    const users = await userModel
      .find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
        ],
      })
      .select("username avatar")
      .limit(5)
      .lean();

    // Format suggestions
    const suggestions = {
      videos: videos.map((video) => ({
        _id: video._id,
        type: "video",
        title: video.title,
        thumbnail: video.thumbnail,
        views: video.views,
        owner: video.owner,
      })),
      users: users.map((user) => ({
        _id: user._id,
        type: "user",
        username: user.username,
        avatar: user.avatar,
      })),
    };

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
    });
  }
};

// Full search results
 const search = async (req, res) => {
  try {
    const { query, type = "all", page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        videos: [],
        users: [],
        totalVideos: 0,
        totalUsers: 0,
      });
    }

    const searchRegex = new RegExp(query.trim(), "i");
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let videos = [];
    let users = [];
    let totalVideos = 0;
    let totalUsers = 0;

    // Search videos
    if (type === "all" || type === "videos") {
      const videoQuery = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      };

      videos = await videoModel
        .find(videoQuery)
        .select("title description thumbnail videoURL duration views createdAt")
        .populate("owner", "username avatar")
        .sort({ views: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      totalVideos = await videoModel.countDocuments(videoQuery);
    }

    // Search users
    if (type === "all" || type === "users") {
      const userQuery = {
        $or: [
          { username: searchRegex },
          { email: searchRegex },
        ],
      };

      users = await userModel
        .find(userQuery)
        .select("username avatar email createdAt")
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      totalUsers = await userModel.countDocuments(userQuery);

      // Add subscriber count (if you have a subscription model)
      // users = await Promise.all(
      //   users.map(async (user) => ({
      //     ...user,
      //     subscribers: await subscriptionModel.countDocuments({ channel: user._id }),
      //   }))
      // );
    }

    res.json({
      success: true,
      query: query.trim(),
      videos,
      users,
      totalVideos,
      totalUsers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(
        Math.max(totalVideos, totalUsers) / parseInt(limit)
      ),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};


export {
    saveVideo,
    getVideos,
    PlayingVideoData,
    getSearchSuggestions,
    search
}