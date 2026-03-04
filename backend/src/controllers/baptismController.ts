import { Request, Response } from "express";
import * as baptismService from "../services/baptismService";
import generateNextNumber from "../utils/numberGenerator";

const createBaptism = async (req: Request, res: Response): Promise<void> => {
  try {
    const saved = await baptismService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
}; 

const getAllBaptisms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const baptisms = await baptismService.getAll();
    res.status(200).json({ success: true, data: baptisms });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getBaptismById = async (req: Request, res: Response): Promise<void> => {
  try {
    const baptism = await baptismService.getById(req.params.id as string);
    if (!baptism) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: baptism });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateBaptism = async (req: Request, res: Response): Promise<void> => {
  try {
    const baptism = await baptismService.update(req.params.id as string, req.body);
    if (!baptism) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: baptism });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchBaptisms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await baptismService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteBaptism = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await baptismService.remove(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Baptism record deleted successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNextBaptismNumber = async (_req: Request, res: Response): Promise<void> => {
  try {
    const nextNumber = await generateNextNumber("baptisms", "baptismNo", "BP");
    res.status(200).json({ success: true, data: { nextNumber } });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createBaptism, getAllBaptisms, getBaptismById, updateBaptism, deleteBaptism, searchBaptisms, getNextBaptismNumber };
