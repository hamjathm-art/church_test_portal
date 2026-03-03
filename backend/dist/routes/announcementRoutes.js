"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcementController_1 = require("../controllers/announcementController");
const router = (0, express_1.Router)();
router.post("/", announcementController_1.createAnnouncement);
router.get("/", announcementController_1.getAllAnnouncements);
router.get("/search", announcementController_1.searchAnnouncements);
router.get("/:id", announcementController_1.getAnnouncementById);
router.put("/:id", announcementController_1.updateAnnouncement);
router.delete("/:id", announcementController_1.deleteAnnouncement);
router.patch("/:id/status", announcementController_1.toggleAnnouncementStatus);
exports.default = router;
//# sourceMappingURL=announcementRoutes.js.map