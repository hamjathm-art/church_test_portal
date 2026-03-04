import { Request, Response } from "express";
import * as burialService from "../services/burialService";
import generateNextNumber from "../utils/numberGenerator";

const createBurial = async (req: Request, res: Response): Promise<void> => {
  try {
    const saved = await burialService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(400).json({ success: false, message: "Server error" });
  }
};

const getAllBurials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await burialService.getAll();
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false });
  }
};

const updateBurial = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await burialService.update(req.params.id as string, req.body);
    res.json({ success: true, data: updated });
  } catch {
    res.status(400).json({ success: false });
  }
};

const getBurialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const burial = await burialService.getById(req.params.id as string);
    if (!burial) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: burial });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchBurials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await burialService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNextBurialNumber = async (_req: Request, res: Response): Promise<void> => {
  try {
    const nextNumber = await generateNextNumber("burials", "burialNo", "BL");
    res.status(200).json({ success: true, data: { nextNumber } });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createBurial, getAllBurials, updateBurial, getBurialById, searchBurials, getNextBurialNumber };
