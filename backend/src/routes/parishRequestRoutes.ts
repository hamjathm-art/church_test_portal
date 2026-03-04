import { Router } from "express";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  searchRequests,
  getNextRequestNumber,
} from "../controllers/parishRequestController";

const router = Router();

router.post("/", createRequest);
router.get("/", getAllRequests);
router.get("/search", searchRequests);
router.get("/next-number", getNextRequestNumber);
router.get("/:id", getRequestById);
router.put("/:id", updateRequest); 
router.delete("/:id", deleteRequest);

export default router;
