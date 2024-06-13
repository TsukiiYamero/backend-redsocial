import { Router } from "express";
import { testUserController, userRegisterC } from "../controllers/user.js";
import { RouteUser, RouteUserRegister } from "../utils/utils.js";

const router = Router();
router.get(RouteUser, testUserController);
router.post(RouteUserRegister, userRegisterC)



export const userRouter = router;