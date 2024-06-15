import { Router } from "express";
import { listUsersC, loginC, profileC, testUserController, userRegisterC } from "../controllers/user.js";
import { RouteListUsers, RouteLogin, RouteProfile, RouteUser, RouteUserRegister } from "../utils/utils.js";
import { ensureAuth } from "../middlewares/auth.js";

const router = Router();
router.get(RouteUser, ensureAuth, testUserController);
router.get(`${RouteProfile}/:id`, ensureAuth, profileC)
router.get(`${RouteListUsers}`, ensureAuth, listUsersC)

router.post(RouteUserRegister, userRegisterC)
router.post(RouteLogin, loginC)



export const userRouter = router;