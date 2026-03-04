import { Request, Response } from "express";
import * as massIntentionService from "../services/massIntentionService";
import generateNextNumber from "../utils/numberGenerator";

const createIntention = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contactNumber, emailAddress } = req.body;
    if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
      res.status(400).json({ success: false, message: "Contact number must be exactly 10 digits" });
      return;
    }
    if (emailAddress && !/\S+@\S+\.\S+/.test(emailAddress)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    } 
    const saved = await massIntentionService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllIntentions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const intentions = await massIntentionService.getAll();
    res.status(200).json({ success: true, data: intentions });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getIntentionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const intention = await massIntentionService.getById(req.params.id as string);
    if (!intention) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: intention });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateIntention = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contactNumber, emailAddress } = req.body;
    if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
      res.status(400).json({ success: false, message: "Contact number must be exactly 10 digits" });
      return;
    }
    if (emailAddress && !/\S+@\S+\.\S+/.test(emailAddress)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }
    const intention = await massIntentionService.update(req.params.id as string, req.body);
    if (!intention) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: intention });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchIntentions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await massIntentionService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const checkAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const dates: Record<string, string> = {};
    for (let i = 1; i <= 4; i++) {
      const val = req.query[`slot${i}Date`];
      if (val) dates[`slot${i}Date`] = val as string;
    }
    const excludeId = req.query.excludeId as string | undefined;
    const availability = await massIntentionService.checkAvailability(dates, excludeId);
    res.status(200).json({ success: true, data: availability });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteIntention = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await massIntentionService.remove(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Mass intention deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNextIntentionNumber = async (_req: Request, res: Response): Promise<void> => {
  try {
    const nextNumber = await generateNextNumber("mass_intentions", "intentionNo", "MI");
    res.status(200).json({ success: true, data: { nextNumber } });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createIntention, getAllIntentions, getIntentionById, updateIntention, deleteIntention, searchIntentions, checkAvailability, getNextIntentionNumber };
