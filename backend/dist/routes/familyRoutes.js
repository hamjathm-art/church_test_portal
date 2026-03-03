"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const familyController_1 = require("../controllers/familyController");
const router = (0, express_1.Router)();
router.post("/", familyController_1.createFamily);
router.get("/", familyController_1.getAllFamilies);
router.get("/search", familyController_1.searchFamilies);
router.get("/:id", familyController_1.getFamilyById);
router.put("/:id", familyController_1.updateFamily);
exports.default = router;
//# sourceMappingURL=familyRoutes.js.map