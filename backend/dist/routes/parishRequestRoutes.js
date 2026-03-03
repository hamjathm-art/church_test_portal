"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parishRequestController_1 = require("../controllers/parishRequestController");
const router = (0, express_1.Router)();
router.post("/", parishRequestController_1.createRequest);
router.get("/", parishRequestController_1.getAllRequests);
router.get("/search", parishRequestController_1.searchRequests);
router.get("/:id", parishRequestController_1.getRequestById);
router.put("/:id", parishRequestController_1.updateRequest);
router.delete("/:id", parishRequestController_1.deleteRequest);
exports.default = router;
//# sourceMappingURL=parishRequestRoutes.js.map