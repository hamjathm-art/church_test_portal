import { Router } from "express";
import {
  createConfirmation,
  getAllConfirmations,
  getConfirmationById,
  updateConfirmation,
  searchConfirmations,
} from "../controllers/confirmationController";

const router = Router();

router.post("/", createConfirmation);
router.get("/", getAllConfirmations);
router.get("/search", searchConfirmations);
router.get("/:id", getConfirmationById);
router.put("/:id", updateConfirmation);

export default router;
