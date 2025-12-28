import express from "express";
import { addToWatchHistory, clearWatchHistory, getWatchHistory, removeFromWatchHistory } from "../Controllers/watch-history.controller.js";
import { auth } from "../Middlewares/auth.js";

const HistoryRouter = express.Router();

HistoryRouter.post("/", auth, addToWatchHistory);
HistoryRouter.get("/", auth, getWatchHistory);
HistoryRouter.delete("/clear", auth, clearWatchHistory);
HistoryRouter.delete("/:videoId", auth, removeFromWatchHistory);

export default HistoryRouter;
