import { Router } from "express";
import { deletePublication, feed, publicationsUser, savePublication, showMedia, showPublication, testPublicationsController, uploadMedia } from "../controllers/publications.js";
import { RoutePublications } from "../utils/utils.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from "multer";
import { checkEntityExists } from "../services/checkEntityExists.js";
import publications from "../models/publications.js";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/publications/')
    },
    filename: function (req, file, cb) {
        cb(null, `pub-${Date.now()}-${file.originalname}`)
    }
})

const uploads = multer({ storage: storage })
const router = Router();
router.get(RoutePublications, testPublicationsController);
router.post('/publication', ensureAuth, savePublication);
router.post('/show-publication/:id', ensureAuth, showPublication);
router.delete('/delete-publication/:id', ensureAuth, deletePublication);
router.get('/publications-user/:id/:page?', ensureAuth, publicationsUser);
router.post('/upload-media/:id', [ensureAuth, checkEntityExists(publications, 'id'), uploads.single("file0")], uploadMedia);
router.post('/media/:file', showMedia);

router.get('/feed/:page?', ensureAuth, feed);


export default router;