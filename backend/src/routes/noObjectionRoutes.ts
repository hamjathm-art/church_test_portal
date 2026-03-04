import { Router } from "express";
import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  searchRecords,
  getNextObjectionNumber,
} from "../controllers/noObjectionController";

const router = Router();

router.post("/", createRecord);
router.get("/", getAllRecords);
router.get("/search", searchRecords);
router.get("/next-number", getNextObjectionNumber);
router.get("/:id", getRecordById);
router.put("/:id", updateRecord);

export default router;
