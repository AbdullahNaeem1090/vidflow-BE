import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../Models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Something went wrong while generating refresh and access tokens");
  }
};

const auth = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;  

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "No access token found, please log in",
    });
  }

  try {
    // ✅ Verify access token
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -refreshToken -createdAt -updatedAt -watchHistory");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    return next();

  } catch (error) {
    // ✅ Handle expired access token with refresh token
    
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });

  }
});

export { auth, generateAccessAndRefereshTokens };
