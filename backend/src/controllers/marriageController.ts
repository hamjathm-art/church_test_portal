import { Request, Response } from "express";
import * as marriageService from "../services/marriageService";
import generateNextNumber from "../utils/numberGenerator";

const createMarriage = async (req: Request, res: Response): Promise<void> => {
  try {
    const saved = await marriageService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllMarriages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const marriages = await marriageService.getAll();
    res.status(200).json({ success: true, data: marriages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMarriageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const marriage = await marriageService.getById(req.params.id as string);
    if (!marriage) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: marriage });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateMarriage = async (req: Request, res: Response): Promise<void> => {
  try {
    const marriage = await marriageService.update(req.params.id as string, req.body);
    if (!marriage) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: marriage });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchMarriages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await marriageService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch (error) {
    console.error("Marriage search error:", error instanceof Error ? error.message : error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNextMarriageNumber = async (_req: Request, res: Response): Promise<void> => {
  try {
    const nextNumber = await generateNextNumber("marriages", "marriageNo", "MG");
    res.status(200).json({ success: true, data: { nextNumber } });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createMarriage, getAllMarriages, getMarriageById, updateMarriage, searchMarriages, getNextMarriageNumber };
