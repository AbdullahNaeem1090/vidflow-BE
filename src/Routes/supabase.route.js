import express from "express";
import {
  userSignUp,
  userLogin,
  logoutUser,
  changePassword,
  check
} from "../Controllers/auth.controller.js";
import { DownloadUrl, UploadUrl } from "../Controllers/supabase.controller.js";

const SupabaseRouter = express.Router();

SupabaseRouter.post("/upload-url",UploadUrl);
SupabaseRouter.post("/download-url",DownloadUrl);


export { SupabaseRouter } 