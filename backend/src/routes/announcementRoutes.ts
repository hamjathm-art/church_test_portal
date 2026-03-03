import { Router } from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  searchAnnouncements,
  toggleAnnouncementStatus,
} from "../controllers/announcementController";

const router = Router();

router.post("/", createAnnouncement);
router.get("/", getAllAnnouncements);
router.get("/search", searchAnnouncements);
router.get("/:id", getAnnouncementById);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);
router.patch("/:id/status", toggleAnnouncementStatus);

export default router;
