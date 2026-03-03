import { Router } from "express";
import {
  createMarriage,
  getAllMarriages,
  getMarriageById,
  updateMarriage,
  searchMarriages,
} from "../controllers/marriageController";

const router = Router();

router.post("/", createMarriage);
router.get("/", getAllMarriages);
router.get("/search", searchMarriages);
router.get("/:id", getMarriageById);
router.put("/:id", updateMarriage);

export default router;
