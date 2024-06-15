import { Router } from "express";
import { loginC, profileC, testUserController, userRegisterC } from "../controllers/user.js";
import { RouteLogin, RouteProfile, RouteUser, RouteUserRegister } from "../utils/utils.js";
import { ensureAuth } from "../middlewares/auth.js";

const router = Router();
router.get(RouteUser, ensureAuth, testUserController);
router.get(`${RouteProfile}/:id`, ensureAuth, profileC)

router.post(RouteUserRegister, userRegisterC)
router.post(RouteLogin, loginC)



export const userRouter = router;