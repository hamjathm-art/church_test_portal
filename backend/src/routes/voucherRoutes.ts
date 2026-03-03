import { Router } from "express";
import {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  searchVouchers,
} from "../controllers/voucherController";

const router = Router();

router.post("/", createVoucher);
router.get("/", getAllVouchers);
router.get("/search", searchVouchers);
router.get("/:id", getVoucherById);
router.put("/:id", updateVoucher);

export default router;
