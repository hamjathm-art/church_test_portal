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
exports.getNextMarriageNumber = exports.searchMarriages = exports.updateMarriage = exports.getMarriageById = exports.getAllMarriages = exports.createMarriage = void 0;
const marriageService = __importStar(require("../services/marriageService"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const createMarriage = async (req, res) => {
    try {
        const saved = await marriageService.create(req.body);
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
exports.createMarriage = createMarriage;
const getAllMarriages = async (_req, res) => {
    try {
        const marriages = await marriageService.getAll();
        res.status(200).json({ success: true, data: marriages });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllMarriages = getAllMarriages;
const getMarriageById = async (req, res) => {
    try {
        const marriage = await marriageService.getById(req.params.id);
        if (!marriage) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: marriage });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getMarriageById = getMarriageById;
const updateMarriage = async (req, res) => {
    try {
        const marriage = await marriageService.update(req.params.id, req.body);
        if (!marriage) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: marriage });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateMarriage = updateMarriage;
const searchMarriages = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await marriageService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch (error) {
        console.error("Marriage search error:", error instanceof Error ? error.message : error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchMarriages = searchMarriages;
const getNextMarriageNumber = async (_req, res) => {
    try {
        const nextNumber = await (0, numberGenerator_1.default)("marriages", "marriageNo", "MG");
        res.status(200).json({ success: true, data: { nextNumber } });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getNextMarriageNumber = getNextMarriageNumber;
//# sourceMappingURL=marriageController.js.map