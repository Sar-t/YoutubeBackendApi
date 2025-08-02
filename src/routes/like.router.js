import { Like } from "../models/like.models.js"
import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getVideoLikes } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle/video/:videoId")
.post(toggleVideoLike);

router.route("/toggle/comment/:commentId")
.post(toggleCommentLike);

router.route("/toggle/tweet/:tweetId")
.post(toggleTweetLike);

router.route("/get/likes/:videoId")
.get(getVideoLikes);

export default router;