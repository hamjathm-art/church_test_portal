import { Router } from "express";
import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  searchReceipts,
  getNextReceiptNumber,
} from "../controllers/receiptController";

const router = Router();

router.post("/", createReceipt);
router.get("/", getAllReceipts);
router.get("/search", searchReceipts);
router.get("/next-number", getNextReceiptNumber);
router.get("/:id", getReceiptById);
router.put("/:id", updateReceipt);

export default router;
