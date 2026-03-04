import { Router } from "express";
import {
  createBurial,
  getAllBurials,
  getBurialById,
  updateBurial,
  searchBurials,
  getNextBurialNumber,
} from "../controllers/burialController";

const router = Router();

router.post("/", createBurial);
router.get("/", getAllBurials);
router.get("/search", searchBurials);
router.get("/next-number", getNextBurialNumber);
router.get("/:id", getBurialById);
router.put("/:id", updateBurial);

export default router;
