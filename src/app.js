import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    creadentials: true,

}));

app.use(cookieParser()); // Parse cookies from incoming requests
app.use(express.json({limit: '16kb'})); // Limit JSON body size to 16kb
app.use(express.urlencoded({extended:true, limit: '16kb'})); // express.urlencoded() parses the urlencoded payload and attaches it to req.body. ✅
//extended allows nested objects
app.use(express.static('public')); // Serve static files from the 'public' directory



//routes import
import userRoutes from "./routes/user.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"
import videoRoutes from "./routes/video.routes.js"
import playlistRoutes from "./routes/playlist.routes.js"
//routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/video",videoRoutes);
app.use("/api/v1/playlist",playlistRoutes);
//https://localhost:8000/api/v1/users/register

export default app;