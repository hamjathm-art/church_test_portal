import { Request, Response } from "express";
import * as announcementService from "../services/announcementService";

const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const saved = await announcementService.create(req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("Create announcement error:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const announcements = await announcementService.getAll();
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    console.error("Get all announcements error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAnnouncementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcement = await announcementService.getById(req.params.id as string);
    if (!announcement) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    console.error("Get announcement by id error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcement = await announcementService.update(req.params.id as string, req.body);
    if (!announcement) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    console.error("Update announcement error:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, totalCount, page, limit } = await announcementService.search(
      req.query as Record<string, string>
    );
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({ success: true, data, totalCount, page, totalPages });
  } catch (error) {
    console.error("Search announcements error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await announcementService.remove(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const toggleAnnouncementStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["Draft", "Published"].includes(status)) {
      res.status(400).json({ success: false, message: "Status must be Draft or Published" });
      return;
    }
    const announcement = await announcementService.toggleStatus(req.params.id as string, status);
    if (!announcement) {
      res.status(404).json({ success: false, message: "Not found" });
      return;
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    console.error("Toggle announcement status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  searchAnnouncements,
  toggleAnnouncementStatus,
};
