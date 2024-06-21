import { Router } from "express";
import { following, saveFollowC, testFollowController, unfollow } from "../controllers/follow.js";
import { RouteFollow, RouteFollows } from "../utils/utils.js";
import { ensureAuth } from "../middlewares/auth.js";

const router = Router();
router.get(RouteFollow, testFollowController);
router.post(RouteFollows, ensureAuth, saveFollowC)
router.delete("/unfollow/:id", ensureAuth, unfollow);
router.get("/following/:id?/:page?", ensureAuth, following);


export default router;