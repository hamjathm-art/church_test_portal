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
exports.searchFamilies = exports.updateFamily = exports.getFamilyById = exports.getAllFamilies = exports.createFamily = void 0;
const familyService = __importStar(require("../services/familyService"));
const numericFields = ["pincode", "res", "office", "mobile", "fax"];
const validateNumericFields = (body) => {
    for (const field of numericFields) {
        if (body[field] && body[field].trim() && !/^\d+$/.test(body[field].trim())) {
            const label = field === "res" ? "Residence" : field.charAt(0).toUpperCase() + field.slice(1);
            return `${label} must contain only numbers`;
        }
    }
    return null;
};
const createFamily = async (req, res) => {
    try {
        const validationError = validateNumericFields(req.body);
        if (validationError) {
            res.status(400).json({ success: false, message: validationError });
            return;
        }
        const saved = await familyService.create(req.body);
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
exports.createFamily = createFamily;
const getAllFamilies = async (_req, res) => {
    try {
        const data = await familyService.getAll();
        res.status(200).json({ success: true, data });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllFamilies = getAllFamilies;
const getFamilyById = async (req, res) => {
    try {
        const data = await familyService.getById(req.params.id);
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
exports.getFamilyById = getFamilyById;
const updateFamily = async (req, res) => {
    try {
        const validationError = validateNumericFields(req.body);
        if (validationError) {
            res.status(400).json({ success: false, message: validationError });
            return;
        }
        const data = await familyService.update(req.params.id, req.body);
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
exports.updateFamily = updateFamily;
const searchFamilies = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await familyService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchFamilies = searchFamilies;
//# sourceMappingURL=familyController.js.map