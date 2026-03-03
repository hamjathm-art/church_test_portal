import { Router } from "express";
import {
  createBaptism,
  getAllBaptisms,
  getBaptismById,
  updateBaptism,
  deleteBaptism,
  searchBaptisms,
} from "../controllers/baptismController";

const router = Router();

router.post("/", createBaptism);
router.get("/", getAllBaptisms);
router.get("/search", searchBaptisms);
router.get("/:id", getBaptismById);
router.put("/:id", updateBaptism); 
router.delete("/:id", deleteBaptism);

export default router;
