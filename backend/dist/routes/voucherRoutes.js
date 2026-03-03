"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucherController_1 = require("../controllers/voucherController");
const router = (0, express_1.Router)();
router.post("/", voucherController_1.createVoucher);
router.get("/", voucherController_1.getAllVouchers);
router.get("/search", voucherController_1.searchVouchers);
router.get("/:id", voucherController_1.getVoucherById);
router.put("/:id", voucherController_1.updateVoucher);
exports.default = router;
//# sourceMappingURL=voucherRoutes.js.map