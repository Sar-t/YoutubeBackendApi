import {asyncHandler} from "../../utils/asyncHandler.js";

//registers user
const registerUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"ok"
    });
})


export {registerUser};