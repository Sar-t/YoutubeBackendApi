import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const comments = await Comment.find({ video: videoId }).populate('commentedBy', 'username avatar coverImage').sort({ createdAt: -1 });

    if( !comments || comments.length === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, "No comments found for this video")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments retrieved successfully!")
    );
});

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const comments = await Comment.find({ tweet: tweetId }).populate('commentedBy', 'username avatar coverImage').sort({ createdAt: -1 });

    if( !comments || comments.length === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, "No comments found for this tweet")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments retrieved successfully!")
    );
});

const addComment = asyncHandler(async (req, res, type) => {
    const { videoId, tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    let commentData = {
        content,
        commentedBy: userId
    };

    if (type === "video") {
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            throw new ApiError(400, "Invalid video id");
        }
        commentData.video = videoId;
    } else if (type === "tweet") {
        if (!mongoose.Types.ObjectId.isValid(tweetId)) {
            throw new ApiError(400, "Invalid tweet id");
        }
        commentData.tweet = tweetId;
    }

    const newComment = await Comment.create(commentData);
    
    return res.status(201).json(
        new ApiResponse(201, newComment, "Comment added successfully!")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.commentedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await Comment.deleteOne({ _id: commentId });

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully!")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.commentedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully!")
    );
});

export {
    getVideoComments,
    getTweetComments,
    addComment,
    deleteComment,
    updateComment
}
