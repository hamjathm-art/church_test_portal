import { Router } from "express";
import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  searchRecords,
} from "../controllers/noObjectionController";

const router = Router();

router.post("/", createRecord);
router.get("/", getAllRecords);
router.get("/search", searchRecords);
router.get("/:id", getRecordById);
router.put("/:id", updateRecord);

export default router;
