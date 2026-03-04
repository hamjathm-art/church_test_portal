"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noObjectionController_1 = require("../controllers/noObjectionController");
const router = (0, express_1.Router)();
router.post("/", noObjectionController_1.createRecord);
router.get("/", noObjectionController_1.getAllRecords);
router.get("/search", noObjectionController_1.searchRecords);
router.get("/next-number", noObjectionController_1.getNextObjectionNumber);
router.get("/:id", noObjectionController_1.getRecordById);
router.put("/:id", noObjectionController_1.updateRecord);
exports.default = router;
//# sourceMappingURL=noObjectionRoutes.js.map