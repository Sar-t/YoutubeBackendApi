import mongoose, {Schema} from "mongoose"

const videoSchema = new Schema(
{
    videoFile:{ //url from cloudinary
        type: String,
        required: true
    },
    videoFileId:{ //public id from cloudinary
        type: String,
        required: true
    },
    thumbnail:{
        type: String,
        required: true,
    },
    thumbnailId:{ //public id of thumbnail
        type:String,
        required: true
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required:true,
    },
    duration:{
        type: Number, //cloudinary will send details of video
        required: true,
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},
{
    timestamps:true
});



export const Video = mongoose.model("Video",videoSchema);