import { Request, Response } from "express";
import * as parishRequestService from "../services/parishRequestService";

const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email } = req.body;
    if (phone && !/^\d{10}$/.test(phone)) {
      res.status(400).json({ success: false, message: "Phone must be exactly 10 digits" });
      return;
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }
    const saved = await parishRequestService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await parishRequestService.getAll();
    res.status(200).json({ success: true, data: requests });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await parishRequestService.getById(req.params.id as string);
    if (!request) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: request });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, email } = req.body;
    if (phone && !/^\d{10}$/.test(phone)) {
      res.status(400).json({ success: false, message: "Phone must be exactly 10 digits" });
      return;
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }
    const request = await parishRequestService.update(req.params.id as string, req.body);
    if (!request) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await parishRequestService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await parishRequestService.remove(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Parish request deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createRequest, getAllRequests, getRequestById, updateRequest, deleteRequest, searchRequests };
