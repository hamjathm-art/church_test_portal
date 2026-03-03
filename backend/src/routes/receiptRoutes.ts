import { Router } from "express";
import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  searchReceipts,
} from "../controllers/receiptController";

const router = Router();

router.post("/", createReceipt);
router.get("/", getAllReceipts);
router.get("/search", searchReceipts);
router.get("/:id", getReceiptById);
router.put("/:id", updateReceipt);

export default router;
