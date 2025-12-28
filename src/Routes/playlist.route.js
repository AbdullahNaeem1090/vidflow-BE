import express from "express";

import { createPlaylist, deletePlaylist, getPlaylist, getPlaylistVideos, getUserPlaylists, toggleVideoInPlaylist, updatePlaylist } from "../Controllers/playlist.controller.js";
import { auth } from "../Middlewares/auth.js";

const PlaylistRouter = express.Router();

PlaylistRouter.post("/create", auth, createPlaylist);
PlaylistRouter.get("/", auth, getUserPlaylists);
PlaylistRouter.get("/:id", auth, getPlaylist);
PlaylistRouter.put("/:id", auth, updatePlaylist);
PlaylistRouter.delete("/:id", auth, deletePlaylist);
PlaylistRouter.post("/:playlistId/toggle", auth, toggleVideoInPlaylist);
PlaylistRouter.get("/playlistVideos/:playlistId", getPlaylistVideos);

export default PlaylistRouter;
