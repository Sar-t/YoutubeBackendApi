import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    createTweet,
    getUserTweets,
    getTweetsById,
    deleteTweet,
    updateTweet
} from '../controllers/tweet.controller.js';

const router = Router();

router.route("/createTweet")
.post(verifyJWT,createTweet);

router.route("/get/:userId")
.get(getUserTweets);

router.route("/get/:tweetId")
.get(getTweetsById);

router.route("/delete/:tweetId")
.delete(verifyJWT,deleteTweet);

router.route("/update/:tweetId")
.patch(verifyJWT,updateTweet);

export default router;


