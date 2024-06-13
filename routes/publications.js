import { Router } from "express";
import { testPublicationsController } from "../controllers/publications.js";
import { RoutePublications } from "../utils/utils.js";

const router = Router();
router.get(RoutePublications, testPublicationsController);




export default router;