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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextReceiptNumber = exports.searchReceipts = exports.updateReceipt = exports.getReceiptById = exports.getAllReceipts = exports.createReceipt = void 0;
const receiptService = __importStar(require("../services/receiptService"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const numericFields = ["amount"];
const validateNumericFields = (body) => {
    for (const field of numericFields) {
        if (body[field] && body[field].trim() && !/^\d+$/.test(body[field].trim())) {
            const label = field.charAt(0).toUpperCase() + field.slice(1);
            return `${label} must contain only numbers`;
        }
    }
    return null;
};
const createReceipt = async (req, res) => {
    try {
        const validationError = validateNumericFields(req.body);
        if (validationError) {
            res.status(400).json({ success: false, message: validationError });
            return;
        }
        const saved = await receiptService.create(req.body);
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createReceipt = createReceipt;
const getAllReceipts = async (_req, res) => {
    try {
        const data = await receiptService.getAll();
        res.status(200).json({ success: true, data });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllReceipts = getAllReceipts;
const getReceiptById = async (req, res) => {
    try {
        const data = await receiptService.getById(req.params.id);
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
exports.getReceiptById = getReceiptById;
const updateReceipt = async (req, res) => {
    try {
        const validationError = validateNumericFields(req.body);
        if (validationError) {
            res.status(400).json({ success: false, message: validationError });
            return;
        }
        const data = await receiptService.update(req.params.id, req.body);
        if (!data) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateReceipt = updateReceipt;
const searchReceipts = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await receiptService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchReceipts = searchReceipts;
const getNextReceiptNumber = async (_req, res) => {
    try {
        const nextNumber = await (0, numberGenerator_1.default)("receipts", "receiptNo", "RC");
        res.status(200).json({ success: true, data: { nextNumber } });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getNextReceiptNumber = getNextReceiptNumber;
//# sourceMappingURL=receiptController.js.map