import { Router } from "express";

import { deleteVideo, getSearchSuggestions, getVideos, PlayingVideoData, saveVideo, search } from "../Controllers/video.controller.js";
import { auth } from "../Middlewares/auth.js";

const videoRouter = Router()

videoRouter.route("/save-video").post(auth,saveVideo)
videoRouter.route('/get-videos{/:lastVideoId}').get(getVideos);
videoRouter.route('/watch/:id').get(auth,PlayingVideoData);
videoRouter.route("/suggestions").get(getSearchSuggestions);
videoRouter.route("/search").get(search);
videoRouter.delete("/:videoId", auth, deleteVideo)



export default videoRouter