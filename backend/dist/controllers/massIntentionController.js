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
exports.checkAvailability = exports.searchIntentions = exports.deleteIntention = exports.updateIntention = exports.getIntentionById = exports.getAllIntentions = exports.createIntention = void 0;
const massIntentionService = __importStar(require("../services/massIntentionService"));
const createIntention = async (req, res) => {
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
    }
    catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createIntention = createIntention;
const getAllIntentions = async (_req, res) => {
    try {
        const intentions = await massIntentionService.getAll();
        res.status(200).json({ success: true, data: intentions });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllIntentions = getAllIntentions;
const getIntentionById = async (req, res) => {
    try {
        const intention = await massIntentionService.getById(req.params.id);
        if (!intention) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: intention });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getIntentionById = getIntentionById;
const updateIntention = async (req, res) => {
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
        const intention = await massIntentionService.update(req.params.id, req.body);
        if (!intention) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: intention });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateIntention = updateIntention;
const searchIntentions = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await massIntentionService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchIntentions = searchIntentions;
const checkAvailability = async (req, res) => {
    try {
        const dates = {};
        for (let i = 1; i <= 4; i++) {
            const val = req.query[`slot${i}Date`];
            if (val)
                dates[`slot${i}Date`] = val;
        }
        const excludeId = req.query.excludeId;
        const availability = await massIntentionService.checkAvailability(dates, excludeId);
        res.status(200).json({ success: true, data: availability });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.checkAvailability = checkAvailability;
const deleteIntention = async (req, res) => {
    try {
        const deleted = await massIntentionService.remove(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Record not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Mass intention deleted successfully" });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.deleteIntention = deleteIntention;
//# sourceMappingURL=massIntentionController.js.map