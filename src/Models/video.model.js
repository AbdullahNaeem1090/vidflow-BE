import mongoose from 'mongoose'

const videoSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    thumbnail:{
        type:String,
        required:true
    },
    videoURL:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    }
},{timestamps:true})

export const videoModel=mongoose.model("videos",videoSchema)