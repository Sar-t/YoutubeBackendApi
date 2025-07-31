import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels , toggleSubscription , getSubscribers } from "../controllers/subscription.controller.js"

const router = Router();
router.use(verifyJWT); // Apply JWT verification middleware to all routes in this file  

router.route("/channel/:channelId")
.post(toggleSubscription); //subscribe or unsubscribe to a channel

router.route("/channel/subscribed")
.get(getSubscribedChannels) //get all subscriptioned channels of a user

router.route("/channel/subscribers")
.get(getSubscribers)

export default router;



