import { subscriptionModel } from "../Models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const toggleSubscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.body;
  const userId = req.user._id;

  // if (channelId === userId.toString()) {
  //   return res.status(400).json({ success: false, message: "You cannot subscribe to yourself" });
  // }

  const existing = await subscriptionModel.findOne({
    subscriber: userId,
    subscribedTo: channelId
  });

  if (existing) {
    await subscriptionModel.findByIdAndDelete(existing._id);
    return res.status(200).json({ success: true, subscribed: false });
  }

  const newSub = await subscriptionModel.create({
    subscriber: userId,
    subscribedTo: channelId
  });

  return res.status(201).json({ success: true, subscribed: true, data: newSub });
});

export const getSubscriberCount = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const count = await subscriptionModel.countDocuments({ subscribedTo: channelId });

  return res.status(200).json({ success: true, subscribers: count });
});

export const isSubscribed = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const subscribed = await subscriptionModel.findOne({
    subscriber: userId,
    subscribedTo: channelId
  });

  return res.status(200).json({ success: true, subscribed: !!subscribed });
});


export const getSubscribedChannels = asyncHandler(async (req, res) => {
  console.log("called");
  
  const userId = req.user._id

  const subscriptions = await subscriptionModel
    .find({ subscriber: userId })
    .populate("subscribedTo")

  const channels = await Promise.all(
    subscriptions.map(async (sub) => {
      const channel = sub.subscribedTo
      if (!channel) return null

      const subscriberCount = await subscriptionModel.countDocuments({
        subscribedTo: channel._id,
      })

      return {
        id: channel._id,
        name: channel.username,
        avatar: channel.avatar,
        description: channel?.description || "",
        subscriberCount,
      }
    })
  )

  return res.status(200).json({
    success: true,
    data: channels.filter(Boolean),
  })
})

