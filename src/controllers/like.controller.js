import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Video }  from "../models/video.models.js"
import { Like } from "../models/like.models.js";
import { ApiResponse } from "../../utils/ApiResponse.js"
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const userId = req.user._id;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(
            400,
            "Invalid video id"
        )
    }

    const video = await Video.findOne({
        _id:videoId
    });

    if(!video){
        throw new ApiError(
            400,
            "video not found!"
        )
    }

    const like = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if(!like){
        const newLike = await Like.create({
            video: videoId,
            likedBy: userId
        });
        return res.status(201).json(
            new ApiResponse(
                201,
                newLike,
                "Video liked!"
            )
        )
    }else{
        await Like.deleteOne({
            video: videoId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Video unliked!"
            )
        );
    }
});

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const userId = req.user._id;

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(
            400,
            "Invalid comment id"
        )
    }

    const like = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if(!like){
        const newLike = await Like.create({
            comment: commentId,
            likedBy: userId
        });
        return res.status(201).json(
            new ApiResponse(
                201,
                newLike,
                "Comment liked!"
            )
        )
    }else{
        await Like.deleteOne({
            comment: commentId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Comment unliked!"
            )
        );
    }
});

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const userId = req.user._id;

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(
            400,
            "Invalid tweet id"
        )
    }

    const like = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    if(!like){
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: userId
        });
        return res.status(201).json(
            new ApiResponse(
                201,
                newLike,
                "Tweet liked!"
            )
        )
    }else{
        await Like.deleteOne({
            tweet: tweetId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Tweet unliked!"
            )
        );
    }
});

const getVideoLikes = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(
            400,
            "Invalid video id"
        )
    }

    const likes = await Like.find({
        video: videoId
    }).populate("likedBy", "username");

    return res.status(200).json(
        new ApiResponse(
            200,
            likes,
            "Likes fetched successfully!"
        )
    );
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getVideoLikes
}

