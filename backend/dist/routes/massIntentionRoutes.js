"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const massIntentionController_1 = require("../controllers/massIntentionController");
const router = (0, express_1.Router)();
router.post("/", massIntentionController_1.createIntention);
router.get("/", massIntentionController_1.getAllIntentions);
router.get("/search", massIntentionController_1.searchIntentions);
router.get("/check-availability", massIntentionController_1.checkAvailability);
router.get("/next-number", massIntentionController_1.getNextIntentionNumber);
router.get("/:id", massIntentionController_1.getIntentionById);
router.put("/:id", massIntentionController_1.updateIntention);
router.delete("/:id", massIntentionController_1.deleteIntention);
exports.default = router;
//# sourceMappingURL=massIntentionRoutes.js.map