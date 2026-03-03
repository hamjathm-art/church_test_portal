import { Request, Response } from "express";
import * as service from "../services/noObjectionService";

const createRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const saved = await service.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(400).json({ success: false, message: "Server error" });
  }
};

const getAllRecords = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false });
  }
};

const updateRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await service.update(req.params.id as string, req.body);
    res.json({ success: true, data: updated });
  } catch {
    res.status(400).json({ success: false });
  }
};

const getRecordById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getById(req.params.id as string);
    if (!data) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await service.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createRecord, getAllRecords, getRecordById, updateRecord, searchRecords };
