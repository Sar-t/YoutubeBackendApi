import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { Video } from "../models/video.models.js";

const uploadVideo = asyncHandler(async (req,res)=>{
    console.log("reached");
    const {title, description} = req.body;

    if([title,description].some((field)=>field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    const videoUploadPath = req.files?.videoFile[0].path;
    const thumbnailUploadPath = req.files?.thumbnail[0].path;

    if(!videoUploadPath || !thumbnailUploadPath){
        throw new ApiError(400, "Video and thumbail are required!");
    }

    const video = await uploadOnCloudinary(videoUploadPath);
    const thumbnail = await uploadOnCloudinary(thumbnailUploadPath);
    
    console.log("reached");

    const newVideo = await Video.create({
        videoFile: video.url,
        videoFileId: video.public_id,
        thumbnail: thumbnail.url,
        thumbnailId: thumbnail.public_id,
        title,
        description,
        duration: video.duration,
        owner: req.user._id
    });
    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            newVideo,
            "video uploaded successfully!"
        )
    );
});

//get home feed
const getAllVideos = asyncHandler(async (req,res)=>{
    const { page=1, limit=10} = req.query;

    const skip = (page-1) * limit; //skips some videos according to page and limit

    const query = {
        isPublished: true
    }

    const videos = await Video.find(query)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(parseInt(limit)) //parseInt changes limit(string) to integer
        .populate("owner","username email")
    const totalVideos = await Video.countDocuments(query);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                data: videos,
                page: parseInt(page),
                totalPages: Math.ceil(totalVideos/limit)
            },
            "fetched all videos successfully!"
        )
    );
});

//search video by query
const getUserVideos = asyncHandler(async (req,res)=>{
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(
            400,
            "userid is required!"
        )
    }

    const videos = await Video.find({
        owner: req.user._id,
        isPublished: true
    }).sort({createdAt:-1});

    if(videos == []){
        throw new ApiError(
            400,
            "no video found!"
        )
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        videos,
        "user videos fetched successfully!"
    ));
    
});

//get video by id
const getVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(
            400,
            "videoid is required!"
        )
    }

    const video = await Video.findOne({
        _id: videoId
    }).populate("owner","username email");

    if(!video){
        throw new ApiError(
            400,
            "video not found, invalid videoid"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video fetched successfully"
        )
    );


});

//delete video
const deleteVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(
            400,
            "videoid is required!"
        )
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(
            400,
            "video not found, invalid videoid"
        )
    }

    if(video.owner.toString() != req.user._id.toString()){
        throw new ApiError(
            400,
            "unauthorized access!"
        )
    }
    //delete from cloudinary
    const result = await deleteFromCloudinary(video.videoFileId);

    const deleteResultMongoDb = await findByIdAndDelete(videoId);

    if(!deleteResultMongoDb){
        throw new ApiError(
            400,
            "error while deleting video"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            result,
            "video deleted successfully!"
        )
    );

});

const updateVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    console.log("reached");
    if(!videoId){
        throw new ApiError(
            400,
            "videoid is required!"
        )
    }

    const {title, description} = req.body;

    const thumbnailPath = req.file.path;

    if (!title && !description && !thumbnail) {
        throw new ApiError(
            400,
            "At least one of the fields — title, description, or thumbnail — must be provided for update."
        );
    }

    const video = await Video.findById(videoId).select("title description thumbnail thumbnailId");

    if(!video){
        throw new ApiError(
            400,
            "video not found, invalid video id"
        )
    }

    //if thumbnail is to be updated
    if(thumbnailPath){
        console.log("updated thumbnail")
        //delete old thumnail
        const oldThumbailId = video.thumbnailId;
        const result = await deleteFromCloudinary(oldThumbailId);

        //upload new thumbnail and update its public_id
        const upload = await uploadOnCloudinary(thumbnailPath);
        video.thumbnailId = upload.public_id;
        video.thumbnail = upload.url;
    }

    if(title)video.title = title;

    if(description)video.description = description;

    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "video updated successfully!!"
            )
        )

});

const togglePublishStatus = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(
            400,
            "videoid is required!"
        )
    }

    const video = await Video.findById(videoId).select("videoFile isPublished");

    if(!video){
        throw new ApiError(
            400,
            "video not found, invalid video id"
        )
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            `publish status changed to ${video.isPublished}`
        )
    );
});
export {
    uploadVideo,
    getAllVideos,
    getUserVideos,
    getVideo,
    deleteVideo,
    updateVideo,
    togglePublishStatus
}