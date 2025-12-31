import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../Models/user.model.js";
import { generateAccessAndRefereshTokens } from "../Middlewares/auth.js";
import { formatViews, timeAgo } from "../utils/videoControllerHelper.js";
import { videoModel } from "../Models/video.model.js";
import { PlaylistModel } from "../Models/playlist.model.js";
import { subscriptionModel } from "../Models/subscription.model.js";


const userSignUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  console.log(req.body);

  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  let userExists = await userModel.findOne({ email });

  if (userExists) {
    return res.status(409).json({
      success: false,
      message: "User already exists. Try new email",
    });
  }

  let createdUser = await userModel.create({
    username,
    email,
    password,
  });

  let user = await userModel
    .findById(createdUser._id)
    .select("-password -refreshToken");

  if (!user) {
    return res.status(409).json({
      success: false,
      message: "Something went wrong with SignUp. Try again",
    });
  }

  return res.status(200).json({
    success: true,
    data: user,
    message: "User registered successfully",
  });
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email == "" || password == "") {
    return res.status(400).json({
      success: false,
      message: "Both fields are required",
    });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid Cradentials",
    });
  }

  const passIsCorrect = await user.isPasswordCorrect(password);
  if (!passIsCorrect) {
    return res.status(400).json({
      success: false,
      message: "Invalid Cradentials",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken -watchHisbtory -createdAt -updatedAt");

  res
    .cookie("accessToken", accessToken, {
      httpOnly: false,
      secure: true,
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: false,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

  return res.status(200).json({
    success: true,
    data: loggedInUser,
    accessToken,
    message: "Login successful",
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  
  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  const options = {
    httpOnly: false,
    secure: true,
  };

  res.clearCookie("accessToken", options).clearCookie("refreshToken", options);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const check = asyncHandler(async (req, res) => {
  return res.status(200).json({
    message: "Verified",
    success: true,
    accessToken: req.accessToken,
    data: req.user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Both fields are required",
    });
  }


  const user = await userModel.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }


  const isCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isCorrect) {
    return res.status(401).json({
      success: false,
      message: "Wrong password",
    });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

 const updateProfile = async (req, res) => {

    const userId = req.user._id;
    const { username, avatarUrl } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update username if provided
    if(username)
      user.username = username;
  

    // Update profile picture if provided
    if (avatarUrl) {
      user.avatar = avatarUrl;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success:true
    });
};


const getUserChannelData = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const viewerId = req.user?._id // logged-in user (optional)

  // ---- USER CHECK ----
  const user = await userModel.findById(userId)
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  const isOwner = viewerId && viewerId.toString() === userId.toString()

  // ---- SUBSCRIBERS COUNT ----
  const subscribersCount = await subscriptionModel.countDocuments({
    subscribedTo: userId,
  })

  // ---- IS SUBSCRIBED (viewer → this channel) ----
  let isSubscribed = false

  if (viewerId && !isOwner) {
    const sub = await subscriptionModel.findOne({
      subscriber: viewerId,
      subscribedTo: userId,
    })
    isSubscribed = !!sub
  }

  // ---- VIDEOS ----
  const videos = await videoModel
    .find({ owner: userId })
    .sort({ createdAt: -1 })

  const formattedVideos = videos.map((video) => ({
    id: video._id,
    title: video.title,
    thumbnail: video.thumbnail,
    views: formatViews(video.views),
    uploadedAt: timeAgo(video.createdAt),
  }))

  // ---- PLAYLISTS VISIBILITY ----
  const playlistQuery = isOwner
    ? { owner: userId, category: { $in: ["Public", "Private"] } }
    : { owner: userId, category: { $in: ["Public"] } }

  const playlists = await PlaylistModel.find(playlistQuery).populate({
    path: "videos",
    select: "thumbnail",
  })

  const formattedPlaylists = playlists.map((pl) => ({
    id: pl._id,
    title: pl.title,
    thumbnail: pl.videos[0]?.thumbnail || null,
    videoCount: pl.videos.length,
  }))

  // ---- FINAL RESPONSE ----
  return res.status(200).json({
    success: true,
    data: {
      name: user.username,
      subscribers: formatViews(subscribersCount),
      profilePic: user.avatar || "",
      bannerImage: "",
      isSubscribed,      // 👈 added
      isOwner,           // 👈 bonus (frontend loves this)
      videos: formattedVideos,
      playlists: formattedPlaylists,
    },
  })
})




export { userSignUp, userLogin, logoutUser, changePassword, check ,updateProfile,getUserChannelData};
