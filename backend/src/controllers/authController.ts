import { Request, Response } from "express";
import * as authService from "../services/authService";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Email already registered") {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      if (error.name === "ValidationError") {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid email or password") {
      res.status(401).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: "Refresh token required" });
      return;
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

export { register, login, refresh };
