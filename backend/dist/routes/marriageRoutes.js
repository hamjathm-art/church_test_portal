"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marriageController_1 = require("../controllers/marriageController");
const router = (0, express_1.Router)();
router.post("/", marriageController_1.createMarriage);
router.get("/", marriageController_1.getAllMarriages);
router.get("/search", marriageController_1.searchMarriages);
router.get("/next-number", marriageController_1.getNextMarriageNumber);
router.get("/:id", marriageController_1.getMarriageById);
router.put("/:id", marriageController_1.updateMarriage);
exports.default = router;
//# sourceMappingURL=marriageRoutes.js.map