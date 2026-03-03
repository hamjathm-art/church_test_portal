"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const burialController_1 = require("../controllers/burialController");
const router = (0, express_1.Router)();
router.post("/", burialController_1.createBurial);
router.get("/", burialController_1.getAllBurials);
router.get("/search", burialController_1.searchBurials);
router.get("/:id", burialController_1.getBurialById);
router.put("/:id", burialController_1.updateBurial);
exports.default = router;
//# sourceMappingURL=burialRoutes.js.map