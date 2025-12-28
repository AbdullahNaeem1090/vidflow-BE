import express from 'express';
import dotenv from "dotenv"
import connectDB from './Connection/db.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

dotenv.config()
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const port=process.env.PORT

// -------------------------------- ROUTES -------------------------
import { AuthRouter } from './Routes/auth.route.js';
import { SupabaseRouter } from './Routes/supabase.route.js';
import videoRouter from './Routes/video.route.js';
import PlaylistRouter from './Routes/playlist.route.js';
import SubscriptionRouter from './Routes/subscription.route.js';
import CommentRouter from './Routes/comment.route.js';
import HistoryRouter from './Routes/watch-history.route.js';

app.use("/api/auth",AuthRouter)
app.use("/api/supabase",SupabaseRouter)
app.use("/api/video",videoRouter)
app.use("/api/playlist",PlaylistRouter)
app.use("/api/subscription",SubscriptionRouter)
app.use("/api/comment",CommentRouter)
app.use("/api/history",HistoryRouter)




app.listen(port,()=>{
    console.log("backend chal para");
})

connectDB()
