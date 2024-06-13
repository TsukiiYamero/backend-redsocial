import { Router } from "express";
import { testFollowController } from "../controllers/follow.js";
import { RouteFollow } from "../utils/utils.js";

const router = Router();
router.get(RouteFollow, testFollowController);




export default router;