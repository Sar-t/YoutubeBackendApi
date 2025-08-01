import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    deletePlaylist,
    createPlaylist, 
    getPlaylistById, 
    updatePlaylist, 
    addVideosToPlaylist, 
    removeVideosFromPlaylist,
    getUserPlaylists 
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/")
.post(verifyJWT,createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)   
    .patch(verifyJWT,updatePlaylist)
    .delete(verifyJWT,deletePlaylist);

router.route("/add/:playlistId").patch(verifyJWT,addVideosToPlaylist);

router.route("/remove/:playlistId").patch(verifyJWT,removeVideosFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router.route("/delete/:playlistId")
    .delete(verifyJWT,deletePlaylist)

export default router;
