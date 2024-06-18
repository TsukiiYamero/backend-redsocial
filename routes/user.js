import { Router } from "express";
import { avatarC, listUsersC, loginC, profileC, testUserController, updateUserC, uploadFilesC, userRegisterC } from "../controllers/user.js";
import { RouteListUsers, RouteLogin, RouteProfile, RouteUpdateUser, RouteUpload, RouteUser, RouteUserRegister } from "../utils/utils.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/avatars/')
    },
    filename: function (req, file, cb) {
        cb(null, `avatar-${Date.now()}-${file.originalname}`)
    }
})

const uploads = multer({ storage: storage })

const router = Router();
/* user */
router.get(RouteUser, ensureAuth, testUserController);
router.put(RouteUpdateUser, ensureAuth, updateUserC);
router.get('/avatar/:file', ensureAuth, avatarC);
router.post(RouteUpload, [ensureAuth, uploads.single('file0')], uploadFilesC);


router.get(`${RouteProfile}/:id`, ensureAuth, profileC)
router.get(`${RouteListUsers}`, ensureAuth, listUsersC)

router.post(RouteUserRegister, userRegisterC)
router.post(RouteLogin, loginC)



export const userRouter = router;