import {asyncHandler} from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/APIError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
//registers user
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
    
    const doesUserExist = User.find({
        $or: [{ username },{ email }]
    })

    if(doesUserExist){
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(converImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is required!");
    }

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

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User registered successfully!")
    )

    res.status(200).json({
        message: "ok"
    })

})


export {registerUser};