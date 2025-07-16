import { Router } from "express";
import { changeCurrentPasword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([ //multer middleware
        {
            name:"avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);

//secured routes
router.route("/logout")
.post
(
    verifyJWT, 
    logoutUser
);

router.route("/refreshToken")
.post(refreshAccessToken);

router.route("/changePassword")
.post
(
    verifyJWT, 
    changeCurrentPasword
);

router.route("/current-user")
.get
(
    verifyJWT,
    getCurrentUser
);

router.route("/update-account-details")
.patch
(
    verifyJWT,
    updateAccountDetails
); //post will create a new entry

router.route("/update-user-avatar")
.patch
(
    verifyJWT, 
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/update-cover-image")
.patch
(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

router.route("/channel/:username")
.get
(
    verifyJWT,
    getUserChannelProfile
);

router.route("/watch-history")
.get
(
    verifyJWT,
    getWatchHistory
)

export default router;

