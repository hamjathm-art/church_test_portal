import { Router } from "express";
import {
  createConfirmation,
  getAllConfirmations,
  getConfirmationById,
  updateConfirmation,
  searchConfirmations,
  getNextConfirmationNumber,
} from "../controllers/confirmationController";

const router = Router();

router.post("/", createConfirmation);
router.get("/", getAllConfirmations);
router.get("/search", searchConfirmations);
router.get("/next-number", getNextConfirmationNumber);
router.get("/:id", getConfirmationById);
router.put("/:id", updateConfirmation);

export default router;
