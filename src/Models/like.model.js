import mongoose from "mongoose";

const likeSchema= mongoose.Schema({
    likedVideoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"videos"
    },
    likedById:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }
})

export const likeModel=mongoose.model("likes",likeSchema)