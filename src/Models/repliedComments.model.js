import mongoose from "mongoose";

const Rep_CommentSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    ParentComment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      required: true,
    },
    rep_comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Rep_CommentModel = mongoose.model(
  "rep_comments",
  Rep_CommentSchema
);