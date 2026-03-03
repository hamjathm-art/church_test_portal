import { Request, Response } from "express";
import * as confirmationService from "../services/confirmationService";

const createConfirmation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.churchContact && !/^\d+$/.test(req.body.churchContact.trim())) {
      res.status(400).json({ success: false, message: "Church contact must contain only numbers" });
      return;
    }
    const saved = await confirmationService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllConfirmations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await confirmationService.getAll();
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getConfirmationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await confirmationService.getById(req.params.id as string);
    if (!data) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateConfirmation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.churchContact && !/^\d+$/.test(req.body.churchContact.trim())) {
      res.status(400).json({ success: false, message: "Church contact must contain only numbers" });
      return;
    }
    const data = await confirmationService.update(req.params.id as string, req.body);
    if (!data) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchConfirmations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await confirmationService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createConfirmation, getAllConfirmations, getConfirmationById, updateConfirmation, searchConfirmations };
