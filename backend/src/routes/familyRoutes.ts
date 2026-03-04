import { Router } from "express";
import {
  createFamily,
  getAllFamilies,
  getFamilyById,
  updateFamily,
  searchFamilies,
  getNextFamilyNumber,
} from "../controllers/familyController";

const router = Router();

router.post("/", createFamily);
router.get("/", getAllFamilies);
router.get("/search", searchFamilies);
router.get("/next-number", getNextFamilyNumber);
router.get("/:id", getFamilyById);
router.put("/:id", updateFamily);

export default router;
