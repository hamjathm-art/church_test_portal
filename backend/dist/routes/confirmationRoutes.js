"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const confirmationController_1 = require("../controllers/confirmationController");
const router = (0, express_1.Router)();
router.post("/", confirmationController_1.createConfirmation);
router.get("/", confirmationController_1.getAllConfirmations);
router.get("/search", confirmationController_1.searchConfirmations);
router.get("/next-number", confirmationController_1.getNextConfirmationNumber);
router.get("/:id", confirmationController_1.getConfirmationById);
router.put("/:id", confirmationController_1.updateConfirmation);
exports.default = router;
//# sourceMappingURL=confirmationRoutes.js.map