import express from "express";
import {
  userSignUp,
  userLogin,
  logoutUser,
  changePassword,
  check,
  updateProfile,
  getUserChannelData
} from "../Controllers/auth.controller.js";
import { auth } from "../Middlewares/auth.js";
import {signupSchema} from "../zod-validation/ZodAuthSchema.js";
import { validate } from "../Middlewares/validate.js";

const AuthRouter = express.Router();

AuthRouter.post("/signup",validate(signupSchema), userSignUp);
AuthRouter.post("/login", userLogin);
AuthRouter.post("/logout",auth, logoutUser);
AuthRouter.get("/check",auth, check);
AuthRouter.post("/change-password",auth, changePassword);
AuthRouter.post("/update-profile",auth, updateProfile);
AuthRouter.get(
  "/channel/:userId",
  auth,            // optional (needed to know owner vs visitor)
  getUserChannelData
)

export { AuthRouter } 
