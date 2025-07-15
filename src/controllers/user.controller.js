import {asyncHandler} from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
//registers user 
//we dont need to use async handler here because we are not making any web request
const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);

        const refreshToken = await user.generateRefreshToken();
        
        const accessToken = await user.generateAccessToken();
        
        user.refreshToken = refreshToken;

        //saving to database
        await user.save({validateBeforeSave:false}); //otherwise we have to pass all properties while saving

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    //get user details from frontend
    //validate - if all fields empty
    //check for pre-existing user  : use username,email 
    //check for images fields which are required(avatar)
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation response
    //return res
    const {fullname, email, username, password} = req.body;
    console.log(`email: ${email}, username: ${username}, password: ${password}, fullname: ${fullname}`);

    if(
        [fullname, email, username, password].some((field) => field?.trim() == "")
    ){
        throw new ApiError(400, "All fields are required!");
    }
    console.log("some checking");
    const doesUserExist = await User.findOne({
        $or: [{ username },{ email }]
    })
        console.log("does user exist",doesUserExist);
    if(doesUserExist){
        throw new ApiError(409, "Username or email already exists");
    }
    console.log("reached");
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath = "";
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required!");
    }
    console.log("avatar checking path");
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is required!");
    }
    console.log("avatar checking");
    const user = await User.create({
        fullname,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userCreated){
        throw new ApiError(400,"Something went wrong while registering the user!")
    }
    console.log("user created");
    return res.status(201).json(
        new ApiResponse(200, userCreated, "User registered successfully!")
    )

    res.status(200).json({
        message: "ok"
    })

});

const loginUser = asyncHandler(async (req,res) => {
    console.log(req.body);
    //req.body -> data
    const {email,username,password} = req.body;

    if(!username && !email){
        throw new ApiError(400, "username or email is required!");
    }

    //check for exisisting user
    const existingUser = await User.findOne({
        $or: [{username},{email}]
    })
    console.log(existingUser);
    if(!existingUser){
        throw new ApiError(401, "user doesn't exist!");
    }

    //validate password
    //the methods declared in user model can only be accessed by the user(object having all its details); User(model)
    const isPasswordValid = await existingUser.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(403,"username or password does not match!");
    }
    //generate refresh and access token and update them in database
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(existingUser._id);

    const user = await User.findById(existingUser._id);
    console.log(user);
    //send cookies

    const loggedInUser = await User.findById(existingUser._id).select("-refreshToken -password");

    const options = {
        httpOnly: true, //cookie can't be accesed by frontend js
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: {loggedInUser, refreshToken,
                accessToken}
            },
            "logged in successfully!"
        )
    )
    
});

const logoutUser = asyncHandler(async(req,res)=>{
    //delete refreshToken from database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1, //this removes the refreshToken field
            }
            
        },
        {
            new: true //this make sure that the new updated user is returned as response
        }
    )
    const updatedUser = await User.findById(req.user._id);
    console.log("updated:",updatedUser);

    //delete cookies
    const options = {
        httpOnly: true, //cookie can't be accesed by frontend js
        secure: true
    }

    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out!"));

});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(incomingRefreshToken){
        throw new ApiError(401,"unauthorised request");
    }

    try {
        const decodedToken = await jwt.verify( //we would decode all the information sent jwt while generating refreshToken
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401,"invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token in expired or used!");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken};