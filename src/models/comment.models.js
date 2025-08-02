import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema(
    {
        content:{
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        commentedBy:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamp: true
    }
);

export const Comment = mongoose.model("Comment", commentSchema);