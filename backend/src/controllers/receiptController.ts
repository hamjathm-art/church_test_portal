import { Request, Response } from "express";
import * as receiptService from "../services/receiptService";
import generateNextNumber from "../utils/numberGenerator";

const numericFields = ["amount"];

const validateNumericFields = (body: Record<string, string>): string | null => {
  for (const field of numericFields) {
    if (body[field] && body[field].trim() && !/^\d+$/.test(body[field].trim())) {
      const label = field.charAt(0).toUpperCase() + field.slice(1);
      return `${label} must contain only numbers`;
    }
  }
  return null;
};

const createReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateNumericFields(req.body);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }
    const saved = await receiptService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllReceipts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await receiptService.getAll();
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getReceiptById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await receiptService.getById(req.params.id as string);
    if (!data) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateNumericFields(req.body);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }
    const data = await receiptService.update(req.params.id as string, req.body);
    if (!data) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchReceipts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await receiptService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNextReceiptNumber = async (_req: Request, res: Response): Promise<void> => {
  try {
    const nextNumber = await generateNextNumber("receipts", "receiptNo", "RC");
    res.status(200).json({ success: true, data: { nextNumber } });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { createReceipt, getAllReceipts, getReceiptById, updateReceipt, searchReceipts, getNextReceiptNumber };
