import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllVideos, uploadVideo, getUserVideos, getVideo, deleteVideo, updateVideo, togglePublishStatus } from "../controllers/video.controller.js"
const router = Router();


router.route("/upload")
.post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadVideo
)

router.route("/")  //get all videos of all users
.get(
    getAllVideos
)

router.route("/:userId")
.get(
    verifyJWT,
    getUserVideos
)

router.route("/:videoId")
.get(
    getVideo
)
.delete(
    verifyJWT,
    deleteVideo
)
.patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
)

router.route("/toggle/publish/:videoId")
.patch(
    verifyJWT,
    togglePublishStatus
)

export default router;
