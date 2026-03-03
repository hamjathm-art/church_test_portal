import express from "express";
import cors from "cors";
import verifyToken from "./middleware/authMiddleware";
import baptismRoutes from "./routes/baptismRoutes";
import marriageRoutes from "./routes/marriageRoutes";
import confirmationRoutes from "./routes/confirmationRoutes";
import burialRoutes from "./routes/burialRoutes";
import noObjectionRoutes from "./routes/noObjectionRoutes";
import familyRoutes from "./routes/familyRoutes";
import receiptRoutes from "./routes/receiptRoutes";
import voucherRoutes from "./routes/voucherRoutes";
import parishRequestRoutes from "./routes/parishRequestRoutes";
import massIntentionRoutes from "./routes/massIntentionRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(cors());
app.use(express.json());

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
app.use("/api/auth", authRoutes);

// Protected Routes (token required)
app.use("/api/baptism", verifyToken, baptismRoutes);
app.use("/api/marriage", verifyToken, marriageRoutes);
app.use("/api/confirmation", verifyToken, confirmationRoutes);
app.use("/api/burial", verifyToken, burialRoutes);
app.use("/api/no-objection", verifyToken, noObjectionRoutes);
app.use("/api/family", verifyToken, familyRoutes);
app.use("/api/receipt", verifyToken, receiptRoutes);
app.use("/api/voucher", verifyToken, voucherRoutes);
app.use("/api/parish-request", verifyToken, parishRequestRoutes);
app.use("/api/mass-intention", verifyToken, massIntentionRoutes);
app.use("/api/announcement", verifyToken, announcementRoutes);

export default app;
