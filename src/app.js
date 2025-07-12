import express from 'express';
import cookieParser from 'cookie-parser';

import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    creadentials: true,

}));

app.use(express.json({limit: '16kb'})); // Limit JSON body size to 16kb
app.use(express.urlencoded({extended:true, limit: '16kb'})); // express.urlencoded() parses the urlencoded payload and attaches it to req.body. ✅
//extended allows nested objects
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cookieParser()); // Parse cookies from incoming requests
export default app;