import express from "express";
import {
  toggleSubscribe,
  getSubscriberCount,
  isSubscribed,
  getSubscribedChannels
} from "../Controllers/subscription.controller.js";
import { auth } from "../Middlewares/auth.js";

const SubscriptionRouter = express.Router();

SubscriptionRouter.post("/toggle", auth, toggleSubscribe);
SubscriptionRouter.get("/count/:channelId", getSubscriberCount);
SubscriptionRouter.get("/is-subscribed/:channelId", auth, isSubscribed);
SubscriptionRouter.get("/subscribed-channels", auth, getSubscribedChannels);

export default SubscriptionRouter;
