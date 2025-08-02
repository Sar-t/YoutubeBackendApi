import { asyncHandler } from "../../utils/asyncHandler";
import { Tweet } from "../models/tweet.models";

const createTweet = asyncHandler(async (req, res) => {  
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        createdBy: userId
    });

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully!")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const tweets = await Tweet.find({ owner: userId }).populate("owner", "username");

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets retrieved successfully!")
    );
});

const getTweetsById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId).populate("owner", "username");

    if (!tweet) {
        return res.status(404).json(
            new ApiResponse(404, null, "Tweet not found with this id")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet retrieved successfully!")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
        return res.status(404).json(
            new ApiResponse(404, null, "Tweet not found with this id")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Tweet deleted successfully!")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params; 
    const { content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.findByIdAndUpdate(tweetId, 
        { content },
        { new: true }
    );
    if (!tweet) {
        return res.status(404).json(
            new ApiResponse(404, null, "Tweet not found with this id")
        );
    }
    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully!")
    );
});

export{
    createTweet,
    getUserTweets,
    getTweetsById,
    deleteTweet,
    updateTweet
}