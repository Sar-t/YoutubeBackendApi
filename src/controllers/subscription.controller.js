import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose from "mongoose";
async function isSubscribed(channelId,subscriberId){
    // This function checks if a user is subscribed to a channel
    // It should return true if the user is subscribed, otherwise false
    // You can implement this function based on your database schema
    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    });
    if(subscription) {
        return true; // User is subscribed
    }else {
        return false; // User is not subscribed
    }
}

const toggleSubscription = asyncHandler(async (req,res)=>{
    // channel/:channelId
    const channelId = req.params.channelId;

    const ifSubscribed = await isSubscribed(channelId,req.user._id);
    if(ifSubscribed){
        console.log("channel exists ",ifSubscribed);
        //User is subscribed already then we ubsubscribe
        await Subscription.findOneAndDelete({
            channel: channelId,
            subscriber: req.user._id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Channel unsubscribed successfully!"
            )
        )
    }else{
        console.log("channel doesn't exist ",ifSubscribed);
        //User not subscribed then we subscribe
        const newSubscription = await Subscription.create({
            channel: new mongoose.Types.ObjectId(channelId),
            subscriber: new mongoose.Types.ObjectId(req.user._id)
        });

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newSubscription,
                "Channel subscribed successfully!"
            )
        )

    }
});

const getSubscribedChannels = asyncHandler(async (req,res)=>{
    const channelId = req.params.channelId;

    const subscriptions = await Subscription.find({
        subscriber: req.user._id
    }).populate({
        path: "channel", //select channel field from subcription model where subscriber is the current user
        select: "username fullname avatar coverImage"
    })
    // [{_id,subscriber,channel}]

    const channels = subscriptions.map(doc => doc.channel)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channels,
            "fetched subscribed channels successfully!"
        )
    );
});

const getSubscribers = asyncHandler(async (req,res)=>{

    const subscriptions = await Subscription.find({
        channel: req.user._id
    }).populate({
        path: "subscriber",
        select: "username fullname avatar coverImage"
    });

    const subscribers = subscriptions.map(doc => doc.subscriber);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "subscribers fetched successfully!"
        )
    );
});
export{
    toggleSubscription,
    getSubscribedChannels,
    getSubscribers
};
