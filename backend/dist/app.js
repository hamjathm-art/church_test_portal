"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authMiddleware_1 = __importDefault(require("./middleware/authMiddleware"));
const baptismRoutes_1 = __importDefault(require("./routes/baptismRoutes"));
const marriageRoutes_1 = __importDefault(require("./routes/marriageRoutes"));
const confirmationRoutes_1 = __importDefault(require("./routes/confirmationRoutes"));
const burialRoutes_1 = __importDefault(require("./routes/burialRoutes"));
const noObjectionRoutes_1 = __importDefault(require("./routes/noObjectionRoutes"));
const familyRoutes_1 = __importDefault(require("./routes/familyRoutes"));
const receiptRoutes_1 = __importDefault(require("./routes/receiptRoutes"));
const voucherRoutes_1 = __importDefault(require("./routes/voucherRoutes"));
const parishRequestRoutes_1 = __importDefault(require("./routes/parishRequestRoutes"));
const massIntentionRoutes_1 = __importDefault(require("./routes/massIntentionRoutes"));
const announcementRoutes_1 = __importDefault(require("./routes/announcementRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Root Test
app.get("/", (_req, res) => {
    res.send("Server running");
});
// API Test
app.get("/api/test", (_req, res) => {
    res.json({
        success: true,
        message: "Backend API is working",
    });
});
// Public Routes (no token needed)
app.use("/api/auth", authRoutes_1.default);
// Protected Routes (token required)
app.use("/api/baptism", authMiddleware_1.default, baptismRoutes_1.default);
app.use("/api/marriage", authMiddleware_1.default, marriageRoutes_1.default);
app.use("/api/confirmation", authMiddleware_1.default, confirmationRoutes_1.default);
app.use("/api/burial", authMiddleware_1.default, burialRoutes_1.default);
app.use("/api/no-objection", authMiddleware_1.default, noObjectionRoutes_1.default);
app.use("/api/family", authMiddleware_1.default, familyRoutes_1.default);
app.use("/api/receipt", authMiddleware_1.default, receiptRoutes_1.default);
app.use("/api/voucher", authMiddleware_1.default, voucherRoutes_1.default);
app.use("/api/parish-request", authMiddleware_1.default, parishRequestRoutes_1.default);
app.use("/api/mass-intention", authMiddleware_1.default, massIntentionRoutes_1.default);
app.use("/api/announcement", authMiddleware_1.default, announcementRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map