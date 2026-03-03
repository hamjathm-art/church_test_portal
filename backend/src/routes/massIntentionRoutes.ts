import { Router } from "express";
import {
  createIntention,
  getAllIntentions,
  getIntentionById,
  updateIntention,
  deleteIntention,
  searchIntentions,
  checkAvailability,
} from "../controllers/massIntentionController";

const router = Router();

router.post("/", createIntention);
router.get("/", getAllIntentions);
router.get("/search", searchIntentions);
router.get("/check-availability", checkAvailability);
router.get("/:id", getIntentionById);
router.put("/:id", updateIntention);
router.delete("/:id", deleteIntention);

export default router;
