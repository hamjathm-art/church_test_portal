"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const baptismController_1 = require("../controllers/baptismController");
const router = (0, express_1.Router)();
router.post("/", baptismController_1.createBaptism);
router.get("/", baptismController_1.getAllBaptisms);
router.get("/search", baptismController_1.searchBaptisms);
router.get("/:id", baptismController_1.getBaptismById);
router.put("/:id", baptismController_1.updateBaptism);
router.delete("/:id", baptismController_1.deleteBaptism);
exports.default = router;
//# sourceMappingURL=baptismRoutes.js.map