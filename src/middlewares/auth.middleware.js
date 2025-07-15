import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";


export const verifyJWT = asyncHandler(async (req,res,next)=>{
    try {
        console.log("cookies:",req.cookies);
        console.log("signed cookies:",req.signedCookies);
        console.log("req.header:",req.header("Authorization"));
        
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ",""); //{Authorization: Bearer <Token>}
        console.log(token)

        
        if(!token){
            throw new ApiError(404,"Unauthorised request");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            //TODO: frontend
            throw new ApiError(401,"Invalid access token")   
        }
    
        req.user = user;
        next();
    
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }
})