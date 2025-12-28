import mongoose from "mongoose";
import { PlaylistModel } from "../Models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { timeAgo } from "../utils/videoControllerHelper.js";

export const createPlaylist = asyncHandler(async (req, res) => {
    const { title, category, videoId } = req.body;

    if(!title||!category){
      return  res.status(400).json({ success: false, message: "Field is missing" });
    }

    const playlist = await PlaylistModel.create({
      owner: req.user._id,
      title,
      category: category || "Private",
      videos: videoId ? [videoId] : [],
    });

    return res.status(201).json({
      success: true,
      data:playlist,
    });
})

export const getUserlaylists =asyncHandler( async (req, res) => {
  
    const playlists = await PlaylistModel.find({ owner: req.user._id })
      .populate("videos");

    return res.status(200).json({ success: true,data: playlists });
    
})

export const getPlaylist = asyncHandler(async (req, res) => {

    const playlist = await PlaylistModel.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("videos");

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    return res.status(200).json({ success: true,data: playlist });
  
})

export const updatePlaylist =asyncHandler( async (req, res) => {
  
    const { title, category } = req.body;

    const playlist = await PlaylistModel.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { title, category } },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    return res.json({ success: true, playlist });
  
})

export const deletePlaylist =asyncHandler( async (req, res) => {
  
    const playlist = await PlaylistModel.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    res.json({ success: true, message: "Playlist deleted successfully" });
  
})


export const toggleVideoInPlaylist =asyncHandler( async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.body;

    console.log("playlistId:", playlistId);

    const playlist = await PlaylistModel.findOne({
      _id: playlistId,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    const alreadyIn = playlist.videos.includes(videoId);

    if (alreadyIn) {
      playlist.videos.pull(videoId);
    } else {
      playlist.videos.push(videoId);
    }

    await playlist.save();

    return res.status(200).json({
      success: true,
      playlist,
      message: alreadyIn
        ? "removed"
        : "added",
    });


})


export const getUserPlaylists =asyncHandler( async (req, res) => {

    const userId = req.user._id;

    // Read categories from query → "Public,Private"
    let categories = req.query.category;

    if (categories) {
      categories = categories.split(","); // convert to array
    } else {
      // If no category given → return all playlists
      categories = ["Public"];
    }

    // Get playlists belonging to the user + category filter
    const playlists = await PlaylistModel.find({
      owner: userId,
      category: { $in: categories }
    })
      .populate({
        path: "videos",
        options: { sort: { createdAt: 1 } }, // oldest first
        select: "thumbnail createdAt"
      });

    // Format result
    const formatted = playlists.map((p) => {
      const oldestVideo = p.videos[0]; // first due to sorting

      return {
        id: p._id.toString(),
        name: p.title,
        description: p.description || "",
        videosCount: p.videos.length,
        image: oldestVideo ? oldestVideo.thumbnail : "/default-thumb.png", // fallback
        category: p.category,
        videoIds: p.videos.map(v => v._id.toString()),
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });

})


export const getPlaylistVideos = asyncHandler( async (req, res) => {
  

    const { playlistId } = req.params

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid playlist id",
      })
    }

    const data = await PlaylistModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(playlistId) },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
      { $unwind: "$videos" },
      {
        $lookup: {
          from: "users",
          localField: "videos.owner",
          foreignField: "_id",
          as: "channel",
        },
      },
      { $unwind: "$channel" },
      {
        $project: {
          _id: 0,
          id: "$videos._id",
          title: "$videos.title",
          thumbnail: "$videos.thumbnail",
          views: "$videos.views",
          duration: "$videos.duration",
          timeAgo: "$videos.createdAt",
          channelId: "$channel._id",
          channel: "$channel.username",
          channelPic: "$channel.avatar",
        },
      },
    ])

    const videos = data.map((v) => ({
      ...v,
      timeAgo: timeAgo(v.timeAgo),
    }))

    return res.status(200).json({
      success: true,
      data:videos,
    })

})
