import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoIds = [] } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }

    const userId = req.user._id; 

    // Validate each videoId is a valid objectId
    const invalidVideos = videoIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if(invalidVideos.length > 0){
        throw new ApiError(
            400,
            `Invalid videoids: ${invalid.join(",")}`
        )
    }
    // verify if every video exist in db
    const existingVideos = await Video.find({_id: {$in: videoIds}}).select("_id");
    if(existingVideos.length !== videoIds.length){
        throw new ApiError(
            400,
            "Some video ids are invalid!"
        )
    }


    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: userId,
        videos: existingVideos,  // if you want to allow adding videos at creation
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist, 
            "Playlist created successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos","-videoFileId -isPublished") // if videos is an array of ObjectIds referring to Video model
        .populate("owner", "username email"); // optional, if you want to show playlist owner's details

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    if (!name && !description) {
        throw new ApiError(400, "At least one of name or description must be provided");
    }

    // Find playlist and populate owner info (to check ownership)
    const playlist = await Playlist.findById(playlistId).populate("owner", "_id username");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if current user is the owner
    if (playlist.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    // Update playlist fields if provided
    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    // Find the playlist and populate the owner field
    const playlist = await Playlist.findById(playlistId).populate("owner", "_id");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the current user is the owner of the playlist
    if (playlist.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }

    // Delete the playlist
    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(200, null, "Playlist deleted successfully")
    );
});

const addVideosToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body;
    const userId = req.user._id; // assuming you're using middleware to attach user

    // Validate playlist ID
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }

    // Validate videoIds array
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
        throw new ApiError(400, "videoIds must be a non-empty array");
    }

    // Validate if playlist exists and user is the owner
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.owner.equals(userId)) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }

    // Filter out invalid videoIds
    const validVideos = await Video.find({
        _id: { $in: videoIds }, 
        owner: userId
    });
    const validIds = validVideos.map(video => video._id.toString());

    const invalidIds = videoIds.filter(id => !validIds.includes(id));
    if (invalidIds.length === videoIds.length) {
        throw new ApiError(404, "None of the provided video IDs are valid or the videos are not owned by you!");
    }

    // Add only new videos (avoid duplicates)
    const newVideos = validIds.filter(id => !playlist.videos.includes(id));
    playlist.videos.push(...newVideos);

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            `${newVideos.length} video(s) added to the playlist`
        )
    );
});

const removeVideosFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!playlistId || !videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
        throw new ApiError(400, "Playlist ID and a non-empty array of Video IDs are required");
    }

    // Find playlist and populate owner for authorization
    const playlist = await Playlist.findById(playlistId).populate("owner", "_id");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check ownership
    if (!playlist.owner._id.equals(userId)) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }

    // Remove each videoId from the playlist's videos array
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: { $in: videoIds } } }, // Removes all matching videoIds
        { new: true } //returns the updated document
    ).populate("videos","title description");

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Videos removed from playlist successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate userId format (optional but good practice)
    const user = await User.findOne({_id: userId});
    if(!user){
        throw new ApiError(
            400,
            "invalid user id"
        )
    }

    // Fetch playlists
    const playlists = await Playlist.find({ owner: userId })
        .populate("videos", "videoFile title")         
        .populate("owner", "username")   

    res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            `Found ${playlists.length} playlists`
        )
    );
});


export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideosToPlaylist,
    removeVideosFromPlaylist,
    getUserPlaylists
}

