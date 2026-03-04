"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const receiptController_1 = require("../controllers/receiptController");
const router = (0, express_1.Router)();
router.post("/", receiptController_1.createReceipt);
router.get("/", receiptController_1.getAllReceipts);
router.get("/search", receiptController_1.searchReceipts);
router.get("/next-number", receiptController_1.getNextReceiptNumber);
router.get("/:id", receiptController_1.getReceiptById);
router.put("/:id", receiptController_1.updateReceipt);
exports.default = router;
//# sourceMappingURL=receiptRoutes.js.map