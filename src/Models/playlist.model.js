import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos",
      },
    ],
    category: {
      type: String,
      enum: ["Public", "Private","Personal"],
      default: "Private",
      required: true,
    },
  },
  { timestamps: true }
);

export const PlaylistModel = mongoose.model("playlists", playlistSchema);
