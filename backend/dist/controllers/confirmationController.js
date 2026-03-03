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
exports.searchConfirmations = exports.updateConfirmation = exports.getConfirmationById = exports.getAllConfirmations = exports.createConfirmation = void 0;
const confirmationService = __importStar(require("../services/confirmationService"));
const createConfirmation = async (req, res) => {
    try {
        if (req.body.churchContact && !/^\d+$/.test(req.body.churchContact.trim())) {
            res.status(400).json({ success: false, message: "Church contact must contain only numbers" });
            return;
        }
        const saved = await confirmationService.create(req.body);
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createConfirmation = createConfirmation;
const getAllConfirmations = async (_req, res) => {
    try {
        const data = await confirmationService.getAll();
        res.status(200).json({ success: true, data });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllConfirmations = getAllConfirmations;
const getConfirmationById = async (req, res) => {
    try {
        const data = await confirmationService.getById(req.params.id);
        if (!data) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getConfirmationById = getConfirmationById;
const updateConfirmation = async (req, res) => {
    try {
        if (req.body.churchContact && !/^\d+$/.test(req.body.churchContact.trim())) {
            res.status(400).json({ success: false, message: "Church contact must contain only numbers" });
            return;
        }
        const data = await confirmationService.update(req.params.id, req.body);
        if (!data) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateConfirmation = updateConfirmation;
const searchConfirmations = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await confirmationService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchConfirmations = searchConfirmations;
//# sourceMappingURL=confirmationController.js.map