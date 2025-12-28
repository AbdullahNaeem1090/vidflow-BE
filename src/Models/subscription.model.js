import mongoose from "mongoose";

const subscriptionSchema= mongoose.Schema({
    subscriber:{
      type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    subscribedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }
})

export const subscriptionModel=mongoose.model("subscription",subscriptionSchema)