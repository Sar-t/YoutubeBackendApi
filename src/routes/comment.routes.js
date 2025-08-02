import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments, getTweetComments, addComment, deleteComment, updateComment } from "../controllers/comment.controller.js";
const router = Router();

router.route("/:videoId")
.get(getVideoComments)
.post(verifyJWT,(req,res) => addComment(req,res,"video"));

router.route("/:tweetId")
.get(getTweetComments)
.post(verifyJWT,(req,res) => addComment(req,res,"tweet"));

router.route("/:commentId")
.delete(verifyJWT,deleteComment)
.patch(verifyJWT,updateComment);

export default router;