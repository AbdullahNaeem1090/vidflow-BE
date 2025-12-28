import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true, 
  },
  Commented_Video_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videos",
    required: true, 
  },
  comment: {
    type: String,
    trim: true,
    required: true, 
  },
}, { timestamps: true }); 

export const commentModel = mongoose.model("comments", commentSchema);