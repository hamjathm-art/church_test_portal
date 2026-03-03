"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAnnouncementStatus = exports.searchAnnouncements = exports.deleteAnnouncement = exports.updateAnnouncement = exports.getAnnouncementById = exports.getAllAnnouncements = exports.createAnnouncement = void 0;
const announcementService = __importStar(require("../services/announcementService"));
const createAnnouncement = async (req, res) => {
    try {
        const saved = await announcementService.create(req.body);
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        console.error("Create announcement error:", error);
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createAnnouncement = createAnnouncement;
const getAllAnnouncements = async (_req, res) => {
    try {
        const announcements = await announcementService.getAll();
        res.status(200).json({ success: true, data: announcements });
    }
    catch (error) {
        console.error("Get all announcements error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllAnnouncements = getAllAnnouncements;
const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await announcementService.getById(req.params.id);
        if (!announcement) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: announcement });
    }
    catch (error) {
        console.error("Get announcement by id error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAnnouncementById = getAnnouncementById;
const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await announcementService.update(req.params.id, req.body);
        if (!announcement) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: announcement });
    }
    catch (error) {
        console.error("Update announcement error:", error);
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateAnnouncement = updateAnnouncement;
const searchAnnouncements = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await announcementService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch (error) {
        console.error("Search announcements error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchAnnouncements = searchAnnouncements;
const deleteAnnouncement = async (req, res) => {
    try {
        const deleted = await announcementService.remove(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Record not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    }
    catch (error) {
        console.error("Delete announcement error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.deleteAnnouncement = deleteAnnouncement;
const toggleAnnouncementStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !["Draft", "Published"].includes(status)) {
            res.status(400).json({ success: false, message: "Status must be Draft or Published" });
            return;
        }
        const announcement = await announcementService.toggleStatus(req.params.id, status);
        if (!announcement) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: announcement });
    }
    catch (error) {
        console.error("Toggle announcement status error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.toggleAnnouncementStatus = toggleAnnouncementStatus;
//# sourceMappingURL=announcementController.js.map